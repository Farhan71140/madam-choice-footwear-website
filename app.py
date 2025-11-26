from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/products", response_class=HTMLResponse)
async def products(request: Request):
    return templates.TemplateResponse("products.html", {"request": request})

@app.get("/about", response_class=HTMLResponse)
async def about(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})

@app.get("/contact", response_class=HTMLResponse)
async def contact(request: Request):
    return templates.TemplateResponse("contact.html", {"request": request}) 

@app.get("/privacy-policy", response_class=HTMLResponse)
def privacy_policy(request: Request):
    return templates.TemplateResponse("privacy-policy.html", {"request": request})

@app.get("/terms-of-service", response_class=HTMLResponse)
def terms_of_service(request: Request):
    return templates.TemplateResponse("terms-of-service.html", {"request": request})

@app.post("/contact", response_class=HTMLResponse)
async def contact_form(request: Request, name: str = Form(...), email: str = Form(...), message: str = Form(...)):
    return templates.TemplateResponse("contact.html", {"request": request, "success": True})