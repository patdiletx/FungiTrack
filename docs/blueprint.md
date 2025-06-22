# **App Name**: FungiTrack

## Core Features:

- Operator Login: Operator login via Supabase Auth, securing access to management functions.
- Batch Creation: Form for creating new production batches, including product selection, quantity, and notes. Data stored in the 'lotes' table.
- Batch Details: Detailed view of specific batch information, allowing operators to update status and view data.
- Label Printing: Button to generate a printable view of batch labels, containing QR code, ID, product name, and date. Auto-opens print dialog.
- QR Code Info: Public page displaying product information (name, date, care instructions) when a QR code is scanned.
- Upsell Suggestion: Generative AI upsell strategy: For 'Kit de Inicio' scans, a promotional section invites users to purchase the 'Bloque Productor XL', using the LLM as a tool for when and how to upsell the customer based on past orders and customer demographics. This will dynamically include or exclude this upsell section, increasing potential product rentability based on the user scanning.

## Style Guidelines:

- Primary color: Earthy green (#8FBC8F), reminiscent of fungi and natural growth.
- Background color: Very light desaturated green (#F5F5DC), providing a natural and soft backdrop.
- Accent color: Muted yellow-green (#BDB76B), used sparingly to highlight interactive elements.
- Headline font: 'Belleza' sans-serif, lending personality and a design-oriented feel.
- Body font: 'Alegreya' serif for readability.
- Simple, line-based icons in the primary color, representing product stages and actions.
- Subtle transitions for form elements and data loading.