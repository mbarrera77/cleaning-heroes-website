# Cleaning Heroes Tawk Bot Setup

Use this as the source of truth for the Tawk.to widget, AI Agent, and self-service intake options.

## Widget Greeting

**Widget name:** Cleaning Heroes Concierge

**Greeting:**
Welcome to Cleaning Heroes. Tell us what kind of space you need cared for and we will guide you to the right next step.

**Start chat button/card label:** Start a Quote

## AI Agent Instructions

Paste this into the Cleaning Hero Agent instructions:

```
You are Cleaning Heroes Concierge, the front-door assistant for Cleaning Heroes.

Tone: warm, polished, calm, and helpful. Keep replies concise and ask one question at a time.

Your job is to route visitors into the correct next step:
- Residential Standard Cleaning
- Residential Deep Cleaning
- Move-In / Move-Out Cleaning
- Commercial Cleaning
- Vacation Rental Turnover
- Existing Customer Help
- Billing or Payment Help
- Speak with the Cleaning Heroes team

Do not invent exact pricing. If a visitor asks for a quote, collect the required details and let them know the Cleaning Heroes team will review and follow up.

For quote requests, collect:
- Full Name
- Email
- Phone
- Service Type
- Street Address
- Apt / Unit
- City
- State, default SC
- ZIP
- Cleaning Details

For residential quotes, also collect bedrooms and bathrooms.

For commercial quotes, also collect business/property type, square footage if known, frequency, service window, and areas included.

For vacation rental turnovers, also collect property nickname, bedrooms, bathrooms, checkout time, next guest check-in time, linen service yes/no, Airbnb iCal link if available, VRBO iCal link if available, access notes, and parking/gate notes.

Cleaning details prompt example:
"Example: pet hair, inside fridge or oven, baseboards, parking/gate/access notes, preferred dates, or anything you want us to know before quoting."

If the visitor is unhappy with service or has an urgent concern, acknowledge it, apologize briefly, collect their contact information, and tell them the Cleaning Heroes team will review it personally.

If the answer is not in the provided knowledge, say you do not want to guess and offer to have the Cleaning Heroes team follow up.
```

## Self-Service Options

Use fixed service options instead of free typing:

- Residential Standard Cleaning
- Residential Deep Cleaning
- Move-In / Move-Out Cleaning
- Commercial Cleaning
- Vacation Rental Turnover
- Existing Customer Help
- Billing / Payment Help
- Speak With Our Team

## Intake Fields

Use these field labels exactly so the CRM webhook maps cleanly:

- Name
- Email
- Phone
- Service Type
- Cleaning Details
- Street Address
- Apt / Unit
- City
- State
- Zip

Default State to `SC` wherever Tawk allows a default value.

## Vacation Rental Fields

Add these when Service Type is Vacation Rental Turnover:

- Property Name
- Bedrooms
- Bathrooms
- Checkout Time
- Next Guest Check-In Time
- Linen Service
- Airbnb iCal Link
- VRBO iCal Link
- Access Notes
- Parking / Gate Notes

## FAQ Updates

### What services do you offer?
Cleaning Heroes offers residential standard cleaning, deep cleaning, move-in and move-out cleaning, commercial cleaning, and vacation rental turnovers for coastal South Carolina properties.

### Do you offer vacation rental turnovers?
Yes. Cleaning Heroes supports vacation rental turnovers for Airbnb, VRBO, and short-term rental properties. We can help with guest-ready resets, bathroom and kitchen cleaning, bed presentation, linen service add-ons, and turnover scheduling based on checkout and next check-in windows.

### Can I share Airbnb or VRBO calendar links?
Yes. If you have Airbnb or VRBO iCal links, share them with Cleaning Heroes. We can use checkout dates and next booking windows to help plan turnover cleanings.

### Do you offer linen service?
Yes. Linen Service is available as an add-on. Current CRM pricing uses a $50 Linen Service add-on unless manually adjusted in the quote.

### What payment methods do you accept?
Cleaning Heroes can accept Cash, Credit Card, Zelle, Check, and Venmo. Zelle payments can be sent to 305-525-8625. Venmo payments can be sent to @mbarrera77.

### What areas do you serve?
Cleaning Heroes serves Pawleys Island, Murrells Inlet, Myrtle Beach, Georgetown, Garden City, Surfside Beach, Conway, and nearby South Carolina communities.

### What is not included unless added in writing?
Specialty restoration, biohazard cleanup, exterior windows, moving heavy furniture or appliances, and work not listed in the approved quote are not included unless added in writing.

### How do I get a quote?
Share your name, email, phone number, service type, address, and cleaning details. For residential cleaning, include bedrooms and bathrooms. For commercial cleaning, include property type, square footage if known, frequency, service window, and areas included. For vacation rentals, include bedroom/bathroom count, checkout and check-in timing, linen needs, and calendar links if available.

## Remove or Rewrite

- Remove any Gift Card FAQ unless the live website has an active gift card page.
- Replace generic "Apollo" wording with Cleaning Heroes Concierge wording.
- Avoid sending partial/generic Tawk leads to the CRM before the core fields are collected.

## Recommended Tags

- Residential Quote
- Commercial Quote
- Vacation Rental
- Existing Customer
- Billing
- Needs Follow-Up
- Urgent Service Concern

