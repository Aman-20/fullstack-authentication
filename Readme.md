# Auth App

A full-stack authentication system: a React frontend with a vibrant, consistent UI built with CSS Modules, and a Node.js / Express backend with email OTP verification, password reset and layered rate limiting.

## Features

### Authentication
- Sign up, login and logout
- Email verification with a 6-digit OTP (with resend)
- Forgot and reset password via an emailed link
- JWT stored in an `httpOnly` cookie (1 hour expiry)
- Old sessions are invalidated after a password reset (`passwordChangedAt` check)

### Security
- Passwords are hashed before being stored
- Per-account limits for OTP sends, failed logins and password resets
- Per-IP limits with `express-rate-limit`
- OTP expiry (10 minutes), maximum wrong attempts per code, and a 60 second resend cooldown


### Frontend
- Navbar that changes based on login state
- Coming Soon home page
- Custom 404 page and loading animation
- Responsive layout (mobile friendly)

## Tech Stack

**Frontend**
- React (Vite)
- React Router DOM
- CSS Modules + global CSS variables

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JSON Web Tokens (`jsonwebtoken`) with `cookie-parser`
- `express-rate-limit`
- Nodemailer-style mailer service for OTP and reset emails

## Frontend Routes

| Path | Page |
| --- | --- |
| `/` | Home (Coming Soon) |
| `/signup` | Sign up |
| `/login` | Login |
| `/forgot-password` | Forgot password |
| `/verify-otp` | Verify OTP |
| `/reset-password/:token` | Reset password (link is sent by email) |
| `*` | 404 Not Found |

## Backend Endpoints

Adjust the paths below to match your router.

| Method | Endpoint | Handler | Limiter |
| --- | --- | --- | --- |
| POST | `/signup` | `handleSignup` | email |
| POST | `/verify-otp` | `verifyOtp` | auth |
| POST | `/resend-otp` | `resendOtp` | email |
| POST | `/login` | `handleLogin` | auth |
| POST | `/forgot-password` | `forgotPassword` | email |
| POST | `/reset-password` | `resetPassword` | auth |
| POST | `/logout` | `handleLogout` | none |

## Rate Limits

**Per account (stored in the database)**

| Limit | Value |
| --- | --- |
| OTP sends (signup and resend) | 3 per 15 minutes |
| Password reset requests | 3 per 15 minutes |
| Failed logins | 5 per 15 minutes |
| Wrong guesses per OTP | 5 |
| Resend cooldown | 60 seconds |
| OTP / reset link expiry | 10 minutes |

**Per IP (`express-rate-limit`)**

| Limiter | Value |
| --- | --- |
| Auth routes (login, verify OTP, reset) | 20 per 15 minutes |
| Email routes (signup, resend, forgot) | 10 per hour |



## Deployment Notes

- Set `app.set("trust proxy", 1)` when running behind a proxy (Render, Heroku, Nginx), otherwise all users share one IP for rate limiting.
- If the frontend and backend are on different domains, cookies need `sameSite: "none"` and `secure: true`. Set CORS to your exact frontend origin with `credentials: true`, and verify the `Origin` header on POST requests. If both share the same site, use `sameSite: "lax"`.
- The default rate limit store lives in memory and resets on restart. Use Redis (`rate-limit-redis`) if you run multiple instances.

## Roadmap

- Atomic rate limit and OTP attempt counting (prevents race conditions)
- Hashing OTPs and reset tokens in the database
- Input validation with `zod`

---

**Made with ❤️ and a lot of colors. Feel free to fork, improve, and make it your own!**

If you like this project, give it a ⭐ on GitHub. It really helps!