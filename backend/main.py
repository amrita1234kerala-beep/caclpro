from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CalculationInput(BaseModel):
    expression: str

@app.post("/calculate")
async def calculate(data: CalculationInput):
    try:
        # Normalize calculator symbols to native Python symbols
        expr = data.expression.replace("×", "*").replace("÷", "/").replace("−", "-").strip()
        
        # Safe mathematical workspace sandbox
        allowed_names = {
            "sin": math.sin, "cos": math.cos, "tan": math.tan,
            "sqrt": math.sqrt, "log": math.log10, "ln": math.log,
            "pi": math.pi, "e": math.e
        }
        
        result = eval(expr, {"__builtins__": None}, allowed_names)
        return {"result": str(round(result, 6))}
    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail="Cannot divide by zero")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid math string")

@app.get("/health")
def health():
    return {"status": "ok"}
