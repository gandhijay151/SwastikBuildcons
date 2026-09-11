# Swastik Buildcons Deployment

This project has two deployable parts:

- React frontend in the repository root
- ASP.NET Core API in `backend/SwastikBuildcons.Api`

## 1. Database

Create a SQL Server database named `SwastikBuildconsDb`, then run:

```sql
-- backend/SwastikBuildcons.Api/database.sql
```

The API stores inquiries in the `Leads` table.

## 2. Backend API

Set these production environment variables on your hosting provider:

```txt
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Server=YOUR_SQL_SERVER;Database=SwastikBuildconsDb;User Id=YOUR_SQL_USER;Password=YOUR_SQL_PASSWORD;TrustServerCertificate=True
Cors__AllowedOrigins__0=https://YOUR_FRONTEND_DOMAIN.com
AdminAuth__Username=admin
AdminAuth__Password=CHANGE_TO_A_STRONG_PASSWORD
Smtp__Host=smtp.example.com
Smtp__Port=587
Smtp__EnableSsl=true
Smtp__Username=YOUR_SMTP_USERNAME
Smtp__Password=YOUR_SMTP_PASSWORD
Smtp__FromEmail=noreply@swastikbuildcons.com
Smtp__ToEmail=info@swastikbuildcons.com
```

Production startup validation will fail if:

- SQL Server connection string is missing or still points to LocalDB
- Admin password is empty or still `ChangeThisPassword`
- CORS still points to localhost

Build and publish:

```bash
cd backend/SwastikBuildcons.Api
dotnet restore
dotnet publish -c Release -o publish
```

Health check:

```txt
GET /health
```

Admin endpoints use Basic Auth:

```bash
curl -u admin:YOUR_PASSWORD https://YOUR_API_DOMAIN.com/api/admin/leads
```

## 3. Frontend

Create a production environment file or set this variable in the frontend host:

```txt
VITE_API_BASE_URL=https://YOUR_API_DOMAIN.com
```

Build:

```bash
npm install
npm run build
```

Deploy the `dist` folder to your static hosting provider.

## 4. Final Go-Live Checklist

- SQL database created
- `Leads` table created
- API environment variables configured
- Strong admin password set
- SMTP configured and tested
- Frontend `VITE_API_BASE_URL` points to live API
- Backend CORS includes live frontend domain
- `/health` returns healthy
- Contact form submits successfully
