from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import smtplib
from email.message import EmailMessage
from sqlmodel import SQLModel, Field, Session, create_engine, select
from datetime import datetime
import uuid

# ----------------------------
# App setup
# ----------------------------
app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ----------------------------
# Database setup
# ----------------------------
engine = create_engine("sqlite:///database.db", echo=False)

class Review(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    rating: int
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Order(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    order_id: str = Field(default_factory=lambda: str(uuid.uuid4()), index=True, unique=True)
    product_name: str
    expected_amount: int
    customer_name: str
    customer_phone: str
    status: str = Field(default="pending")  # pending, paid, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    paid_at: datetime | None = None

SQLModel.metadata.create_all(engine)

# ----------------------------
# Routes for static pages
# ----------------------------
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

@app.get("/flats", response_class=HTMLResponse)
def flats(request: Request):
    return templates.TemplateResponse("flats.html", {"request": request})

@app.get("/heels", response_class=HTMLResponse)
def heels(request: Request):
    return templates.TemplateResponse("heels.html", {"request": request})

@app.get("/wedges", response_class=HTMLResponse)
def wedges(request: Request):
    return templates.TemplateResponse("wedges.html", {"request": request})

# ✅ New Bridal Route
@app.get("/bridal", response_class=HTMLResponse)
def bridal(request: Request):
    return templates.TemplateResponse("bridal.html", {"request": request})

# ----------------------------
# Contact form (email)
# ----------------------------
@app.post("/contact", response_class=HTMLResponse)
async def contact_form(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    message: str = Form(...)
):
    gmail_user = "farhanuddin0516@gmail.com"
    gmail_app_password = "replace_with_app_password"

    msg = EmailMessage()
    msg["Subject"] = "New Contact Form Submission - Madam Choice"
    msg["From"] = gmail_user
    msg["To"] = "farhanuddin0516@gmail.com"
    msg.set_content(
        f"New message from Madam Choice Contact Form:\n\n"
        f"Name: {name}\n"
        f"Email: {email}\n"
        f"Message:\n{message}\n"
    )

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(gmail_user, gmail_app_password)
            server.send_message(msg)
        success = True
    except Exception as e:
        print("Email sending failed:", e)
        success = False

    return templates.TemplateResponse("contact.html", {"request": request, "success": success})

# ----------------------------
# Customer Reviews
# ----------------------------
@app.post("/reviews")
async def add_review(name: str = Form(...), rating: int = Form(...), text: str = Form(...)):
    with Session(engine) as session:
        review = Review(name=name, rating=rating, text=text)
        session.add(review)
        session.commit()
        session.refresh(review)
        return {"ok": True, "id": review.id}

@app.get("/reviews")
async def list_reviews():
    with Session(engine) as session:
        reviews = session.exec(select(Review).order_by(Review.created_at.desc())).all()
        return reviews

# ----------------------------
# Orders & Payment (basic flow)
# ----------------------------
@app.post("/orders")
async def create_order(
    product_name: str = Form(...),
    expected_amount: int = Form(...),
    customer_name: str = Form(...),
    customer_phone: str = Form(...)
):
    with Session(engine) as session:
        order = Order(
            product_name=product_name,
            expected_amount=expected_amount,
            customer_name=customer_name,
            customer_phone=customer_phone
        )
        session.add(order)
        session.commit()
        session.refresh(order)
        return {"order_id": order.order_id, "status": order.status}

@app.get("/orders/{order_id}")
async def get_order(order_id: str):
    with Session(engine) as session:
        order = session.exec(select(Order).where(Order.order_id == order_id)).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order