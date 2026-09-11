# Swastik Buildcons API

ASP.NET Core Web API for the Swastik Buildcons construction website.

## Features

- Public lead form submission API
- SQL Server `Leads` table via EF Core
- Admin API for viewing and updating leads
- Basic authentication for admin endpoints
- SMTP email notification on new inquiry
- CORS configured for the Vite React frontend
- Rate limiting on public lead submissions

## Endpoints

| Method | URL | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/leads` | Public | Submit website inquiry |
| `GET` | `/api/admin/leads` | Basic admin | View all leads |
| `GET` | `/api/admin/leads/{id}` | Basic admin | View lead details |
| `PATCH` | `/api/admin/leads/{id}/status` | Basic admin | Update lead status |
| `GET` | `/health` | Public | Health check |

## Lead Request

```json
{
  "name": "Amit Patel",
  "phone": "+91 98765 43210",
  "email": "amit@example.com",
  "projectType": "Interior Designing",
  "budget": "Rs. 10-25 Lakhs",
  "message": "Need interiors and civil renovation for a home in India."
}
```

## Admin Auth

Default development credentials are in `appsettings.json`:

- Username: `admin`
- Password: `ChangeThisPassword`

Change these with Secret Manager, environment variables, or production configuration before deploying.

In production, the API will refuse to start if this password is empty or still set to `ChangeThisPassword`.

Example:

```bash
curl -u admin:ChangeThisPassword https://localhost:7000/api/admin/leads
```

## Database

Default connection string:

```json
"Server=(localdb)\\MSSQLLocalDB;Database=SwastikBuildconsDb;Trusted_Connection=True;TrustServerCertificate=True"
```

Create the table using one of these approaches:

1. Run the SQL in `database.sql`
2. Use EF Core migrations:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## Email

Configure the `Smtp` section:

```json
{
  "Host": "smtp.example.com",
  "Port": 587,
  "EnableSsl": true,
  "Username": "smtp-user",
  "Password": "smtp-password",
  "FromEmail": "noreply@swastikbuildcons.com",
  "FromName": "Swastik Buildcons Website",
  "ToEmail": "info@swastikbuildcons.com"
}
```

If SMTP is not configured, the API still stores leads and logs that email notification was skipped.

## Run

```bash
dotnet restore
dotnet run
```

The React contact form defaults to `http://localhost:5027`. For another API URL, set:

```bash
VITE_API_BASE_URL=https://your-api-domain.com
```

## Production

Use `appsettings.Production.json` only as a template. Prefer real environment variables on the host:

```txt
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=YOUR_SQL_SERVER;Database=SwastikBuildconsDb;User Id=YOUR_SQL_USER;Password=YOUR_SQL_PASSWORD;TrustServerCertificate=True
Cors__AllowedOrigins__0=https://YOUR_FRONTEND_DOMAIN.com
AdminAuth__Username=admin
AdminAuth__Password=CHANGE_TO_A_STRONG_PASSWORD
Smtp__Host=smtp.example.com
Smtp__Username=YOUR_SMTP_USERNAME
Smtp__Password=YOUR_SMTP_PASSWORD
Smtp__FromEmail=noreply@swastikbuildcons.com
Smtp__ToEmail=info@swastikbuildcons.com
```

The root `DEPLOYMENT.md` has the full go-live checklist.
