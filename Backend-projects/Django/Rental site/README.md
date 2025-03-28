# Rental Room Booking Website

This project is a web application that allows users to browse and book rental rooms. The platform is managed by a single admin who oversees the availability of rooms and their details. The website provides an intuitive interface for users to find and book rooms based on their preferences.

## Features

- **Room Listings**: Displays all available rooms for rent, including details such as location, price, and amenities.
- **Search and Filter**: Users can search for rooms based on location and filter results by price or other criteria.
- **Booking System**: Users can book available rooms directly through the website.
- **Admin Management**: The admin can add, update, or remove room listings and manage bookings.

## How It Works

1. **For Users**:
   - Browse the list of available rooms.
   - View detailed information about each room.
   - Book a room by providing necessary details.

2. **For Admin**:
   - Manage room listings (add, edit, or delete).
   - Monitor and manage user bookings.

## Technologies Used

- **Backend**: Django framework for handling server-side logic.
- **Database**: PostgreSQL for storing room and booking data.
- **Frontend**: HTML, CSS, and JavaScript for a responsive user interface.
- **Deployment**: Gunicorn and Whitenoise for serving the application.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JamesMaxx/My-Projects/Rental-site.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Backend-projects/Django/new_school_management
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   python manage.py runserver
   ```

## License

This project is licensed under the MIT License.
