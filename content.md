
# Swastik Buildcons Website Content

This document contains the planned content for each page of the Swastik Buildcons website. Changes are highlighted for review: **new/updated text**, ~~removed text~~.

## Home Page

### Hero Section
- **Headline:** Building Excellence, One Project at a Time
- **Sub-headline:** We transform visions into reality with precision, innovation, and unwavering commitment to quality.
- **Primary CTA:** Get a Free Quote
- **Secondary CTA:** View Our Portfolio

### About Us Snippet
- With over [X] years of combined experience, Swastik Buildcons delivers residential, commercial, and industrial construction solutions that stand the test of time. Our team blends traditional craftsmanship with modern techniques to create spaces that inspire.

### Services Overview
- **Residential Construction:** Custom homes, renovations, and extensions.
- **Commercial Build:** Office spaces, retail outlets, and hospitality venues.
- **Industrial Projects:** Factories, warehouses, and specialized facilities.
- **Civil Construction:** Roads, bridges, dams, water treatment plants, sewer systems, and infrastructure projects.
- **Interior Design:** Full-service design and fit‑out for homes and businesses.

### Call to Action
- Ready to start your project? **Contact us today** for a personalized consultation.

## About Page

### Our Story
- Founded in [Year], Swastik Buildcons began as a small team of passionate builders dedicated to delivering quality craftsmanship. Today, we are a full‑service construction and interior design firm serving clients across [Region].

### Our Mission
- To provide exceptional construction services that exceed client expectations, prioritize safety, and promote sustainable building practices.

### Our Vision
- To be recognized as the leading construction partner known for integrity, innovation, and timeless design.

### Core Values
- **Quality:** Every detail matters.
- **Safety:** Zero‑compromise approach to job site safety.
- **Integrity:** Transparent communication and ethical practices.
- **Innovation:** Embracing new technologies and methods.
- **Community:** Building strong relationships with clients and partners.

### Meet the Team
- *(Placeholder for team photos and bios)*
- **Founder & CEO:** [Name] – Visionary leader with [X] years in construction.
- **Project Director:** [Name] – Expert in large‑scale project management.
- **Lead Architect:** [Name] – Creative force behind our award‑winning designs.
- **Site Superintendent:** [Name] – Ensures every build runs smoothly and safely.

## Services Page

### What We Offer
- From foundation to finishing, we handle every aspect of your project with dedication and modern expertise.

### Our Process (How We Work)
1. **Consultation:** We listen to your needs, budget, and timeline.
2. **Design & Planning:** Detailed drawings, permits, and material selection.
3. **Execution:** Skilled crews bring the design to life on schedule.
4. **Quality Assurance:** Regular inspections and client walkthroughs.
5. **Handover:** Final documentation, warranties, and maintenance guidance.

### Service Categories
- **Residential Construction:** New builds, remodels, additions.
- **Commercial Construction:** Offices, retail, restaurants, hotels.
- **Industrial Construction:** Factories, warehouses, power plants.
- **Civil Construction:** Roads, bridges, dams, water treatment plants, sewer systems, and infrastructure projects.
- **Interior Design & Fit‑Out:** Space planning, custom furniture, finishes.
- **Project Management:** End‑to‑end oversight for third‑party contractors.

### Why Choose Us?
- **Transparent Pricing:** Detailed quotes with no hidden fees.
- **On‑Time Delivery:** Proven track record of meeting schedules.
- **Sustainable Practices:** Eco‑friendly materials and waste reduction.
- **Warranty Protection:** Comprehensive warranties on workmanship.

## Projects Page

### Portfolio Overview
- Explore our recent work across residential, commercial, and industrial sectors. Use the filters below to narrow by project type.

### Filter Options
- All Projects
- Residential
- Commercial
- Industrial
- Civil Construction
- Interior Design

### Project Cards (example)
- **Project Name:** Modern Family Home
  - **Type:** Residential
  - **Location:** [City]
  - **Highlights:** Open‑plan living, energy‑efficient systems, landscaped garden.
- **Project Name:** Tech Hub Office Complex
  - **Type:** Commercial
  - **Location:** [City]
  - **Highlights:** Flexible workspaces, green roof, state‑of‑the‑art IT infrastructure.
- **Project Name:** Industrial Warehouse Expansion
  - **Type:** Industrial
  - **Location:** [City]
  - **Highlights:** 50,000 sq ft expansion, automated logistics, solar panel integration.
- **Project Name:** River Bridge Restoration
  - **Type:** Civil Construction
  - **Location:** [City]
  - **Highlights:** Steel truss bridge, pedestrian walkways, seismic retrofitting.

### Call to Action
- Interested in a similar project? **Request a consultation** to discuss your vision.

## Contact Page

### Get In Touch
- We’re ready to answer your questions and help you start your next project.

### Contact Information
- **Phone:** [Phone Number]
- **Email:** [Email Address]
- **Office Address:** FF-61 Shree Siddheshwar Harbour, Narayan Vidhyalaya Road, Shree Swaminarayan Gurukul Crossing, Dabhoi - Waghodia Ring Rd, Waghodia, Vadodara, Gujarat

### Contact Form
- **Name:** *Required*
- **Phone:** *Required*
- **Email:** *Required*
- **Project Type:** Dropdown (Residential Construction, Commercial Construction, Industrial Sheds & Warehouses, Manufacturing Facilities, Industrial Renovations, Interior Design, Renovation & Remodeling, Turnkey Solution)
- **Budget:** Dropdown (Ranges or Custom)
- **Timeline:** *Required* (e.g., “ASAP”, “Within 3 months”, “6+ months”, “Flexible”)
- **Message:** *Required* – Describe your project in detail.
- **File Upload:** Attach site plans, sketches, or photos (max 5 MB each, allowed formats: .pdf, .jpg, .jpeg, .png, .dwg)
- **Submit Button:** Send Inquiry

### Form Submission Feedback
- **Success:** Thank you! We’ve received your inquiry and will respond within 24 hours.
- **Error:** Please correct the highlighted fields and try again.

### Trust Badges
- Licensed & Insured
- BBB Accredited
- OSHA Safety Certified
- Member, [Local Builders Association]

## Footer Content

- **Logo:** Swastik Buildcons
- **Navigation Links:** Home, About, Services, Projects, Contact
- **Social Media Icons:** Facebook, Instagram, LinkedIn, Twitter
- **Copyright:** © [Year] Swastik Buildcons. All Rights Reserved.
- **Privacy Policy Link**
- **Terms of Service Link**

# Security Features to Implement

To protect the website and user data, the following security measures should be added:

## 1. Transport Layer Security (TLS/HTTPS)
- Enforce HTTPS across all pages.
- Redirect HTTP requests to HTTPS.
- Use modern TLS configurations (TLS 1.2+).

## 2. Secure Headers
- **Content Security Policy (CSP):** Restrict sources for scripts, styles, images, frames, etc.
- **X‑Content‑Type‑Options:** nosniff
- **X‑Frame‑Options:** DENY or SAMEORIGIN
- **Referrer‑Policy:** strict‑origin‑when‑cross‑origin
- **Permissions‑Policy:** limit features like geolocation, camera, microphone.
- **Strict‑Transport‑Security (HSTS):** max‑age=31536000; includeSubDomains; preload

## 3. Input Validation & Sanitization
- Validate all form fields on both client and server side.
- Use allow‑lists for expected data types (e.g., phone numbers, email format).
- Sanitize free‑text inputs to prevent XSS (e.g., using DOMPurify on client, appropriate escaping on server).
- For file uploads:
  - Verify MIME type and file extension.
  - Scan uploaded files for malware (e.g., using an antivirus API).
  - Restrict upload size (already set to 5 MB per file).
  - Store uploaded files outside the web root or serve via signed URLs.

## 4. Authentication & Authorization (if admin area added)
- Use strong password hashing (bcrypt, Argon2).
- Implement multi‑factor authentication (MFA) for admin access.
- Use role‑based access control (RBAC) for different privilege levels.
- Ensure session cookies are Secure, HttpOnly, and SameSite.

## 5. Cross‑Site Request Forgery (CSRF) Protection
- Include anti‑CSRF tokens in all state‑changing forms (POST, PUT, DELETE).
- Validate tokens on the server.

## 6. Rate Limiting & Brute‑Force Protection
- Limit login attempts, form submissions, and API requests per IP.
- Use CAPTCHA or challenge‑response for suspicious activity.

## 7. Dependency Management
- Keep all frontend and backend dependencies up‑to‑date.
- Use tools like npm audit, Dependabot, or similar to detect vulnerabilities.

## 8. Logging & Monitoring
- Log authentication attempts, file uploads, and errors (without sensitive data).
- Set up alerts for unusual patterns (e.g., multiple failed logins, spikes in traffic).

## 9. Regular Security Testing
- Perform periodic vulnerability scans and penetration tests.
- Keep security headers and configurations reviewed quarterly.

## 10. Data Privacy & Compliance
- Clearly state data usage in a Privacy Policy.
- Allow users to request deletion of their data where applicable.
- Encrypt sensitive data at rest (e.g., database fields for personal information).
- Comply with relevant data protection regulations (such as India's PDPB when applicable).
- Implement cookie consent mechanism for tracking technologies.
- Maintain records of processing activities as required by data protection laws.

Implementing these features will help safeguard the Swastik Buildcons website against common web threats and build trust with visitors.
