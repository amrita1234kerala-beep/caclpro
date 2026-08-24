import ast
import math
import operator
import re
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="CalcPro API", version="1.0.0")

# For local development and deployment, you can replace "*" with your
# exact Vercel frontend URL for tighter CORS security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CalculationRequest(BaseModel):
    expression: str = Field(min_length=1, max_length=200)

class CalculationResponse(BaseModel):
    expression: str
    result: str

ALLOWED_NAMES = {
    "pi": math.pi,
    "e": math.e,
    "tau": math.tau,
}

ALLOWED_FUNCTIONS = {
    "sqrt": math.sqrt,
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "asin": math.asin,
    "acos": math.acos,
    "atan": math.atan,
    "log": math.log10,
    "ln": math.log,
    "abs": abs,
    "floor": math.floor,
    "ceil": math.ceil,
}

BIN_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
}

UNARY_OPS = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}

def safe_eval(expression: str) -> float:
    expression = expression.replace("×", "*").replace("÷", "/").replace("^", "**")
    expression = re.sub(r"(?<=\d)%", "/100", expression)
    expression = expression.strip()

    if not expression:
        raise ValueError("Empty expression.")

    tree = ast.parse(expression, mode="eval")

    def evaluate(node: ast.AST) -> Any:
        if isinstance(node, ast.Expression):
            return evaluate(node.body)

        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value

        if isinstance(node, ast.Name) and node.id in ALLOWED_NAMES:
            return ALLOWED_NAMES[node.id]

        if isinstance(node, ast.UnaryOp) and type(node.op) in UNARY_OPS:
            return UNARY_OPS[type(node.op)](evaluate(node.operand))

        if isinstance(node, ast.BinOp) and type(node.op) in BIN_OPS:
            left = evaluate(node.left)
            right = evaluate(node.right)
            if isinstance(node.op, ast.Pow) and abs(right) > 100:
                raise ValueError("Exponent is too large.")
            return BIN_OPS[type(node.op)](left, right)

        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id not in ALLOWED_FUNCTIONS or len(node.args) != 1:
                raise ValueError("Unsupported function.")
            return ALLOWED_FUNCTIONS[node.func.id](evaluate(node.args[0]))

        raise ValueError("Invalid expression.")

    result = evaluate(tree)

    if isinstance(result, complex) or not math.isfinite(float(result)):
        raise ValueError("Result is not a finite real number.")

    return float(result)

def format_result(value: float) -> str:
    if value == 0:
        return "0"
    if value.is_integer() and abs(value) < 1e15:
        return str(int(value))
    return f"{value:.12g}"

@app.get("/")
def root():
    return {"message": "CalcPro API is running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/calculate", response_model=CalculationResponse)
def calculate(request: CalculationRequest):
    try:
        value = safe_eval(request.expression)
        return {
            "expression": request.expression,
            "result": format_result(value),
        }
    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail="Cannot divide by zero.")
    except (ValueError, SyntaxError, OverflowError):
        raise HTTPException(status_code=400, detail="Invalid calculation.")
