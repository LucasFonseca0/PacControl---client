# Pac-Man Arcade Game with Mobile Controller

An implementation of the classic Pac-Man game using React and Canvas, allowing players to use their mobile devices as remote controllers via QR code scanning.

<div align="center">
  <figure>
    <img src="https://github.com/user-attachments/assets/b05a0b05-3dcf-43d4-8f70-db4943de0431" alt="Game Screenshot 1" width="300"/>
  </figure>
  <figure>
    <img src="https://github.com/user-attachments/assets/c590f7a0-1eeb-4dbb-8146-ca451ad12614" alt="Game Screenshot 2" width="300"/>
  </figure>
  <figure>
    <img src="https://github.com/user-attachments/assets/7394c9e3-658f-4e7e-80c5-0468a7efa11f" alt="Game Screenshot 3" width="300"/>
  </figure>
</div>

### Deploy: https://pacman-remote.vercel.app/



## Features

- **Classic Pac-Man Gameplay**: Enjoy the nostalgic feel of the original Pac-Man game.
- **Web-Based**: Play directly in your browser without any additional installations.
- **Mobile Remote Controller**: Scan a QR code to connect your mobile device and control the game.
- **Responsive Joystick Controls**: Smooth and intuitive controls using the nipplejs joystick library.
- **Real-Time Communication**: Seamless interaction between the game and controller using Socket.IO.
- **Multiple Levels**: Progress through levels with increasing difficulty.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed (version 14 or higher recommended).
- **npm or yarn**: Package manager for installing dependencies.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/LucasFonseca0/PacControl---client.git
   cd PacControl---client
   ```

2. **Install Dependencies**

   Using npm:

   ```bash
   npm install
   ```

   Or using yarn:

   ```bash
   yarn install
   ```

     Or using pnpm:

   ```bash
   pnpm install
   ```

3. **Environment Variables**

   - **Create a `.env` File**

     Create a `.env` file in the root directory of the project. You can use the provided `.env.example` file as a reference.

     ```bash
     cp .env.example .env
     ```

   - **Configure Environment Variables**

     Open the `.env` file and configure the environment variables as needed:

     ```bash
     NEXT_PUBLIC_SERVER_URL="http://localhost:3001"
     NEXT_PUBLIC_CLIENT_URL="http://localhost:3000"
     ```

     - `NEXT_PUBLIC_SERVER_URL`: The URL where your Socket.IO server is running.
     - `NEXT_PUBLIC_CLIENT_URL`: The URL where your Next.js client application is running.

     **Note**: Ensure that these URLs match your development or production setup.

4. **Start the Development Server**

   Using npm:

   ```bash
   npm run dev
   ```

   Or using yarn:

   ```bash
   yarn dev
   ```

    Or using pnpm:

   ```bash
   pnpm dev
   ```

   The application should now be running at `http://localhost:3000`.

## Usage

1. **Open the Game**

   Navigate to `http://localhost:3000` in your browser.

2. **Start the Game**

   - A QR code will be displayed on the screen.
   - Scan the QR code using your mobile device to open the remote controller.

3. **Control the Game**

   - Use the on-screen joystick or directional buttons on your mobile device to control Pac-Man.
   - The game will respond to your inputs in real-time.

4. **Gameplay**

   - Collect all the pellets to advance to the next level.
   - Avoid the ghosts, or collect a power pellet to turn the tables.
   - Try to achieve the highest score possible!

## Project Structure

- **components/**: Contains React components for the game, including Pac-Man, Ghosts, Pellets, and the game canvas.
- **pages/**: Next.js pages, including the main game page and the remote controller page.
- **utils/**: Utility functions for game logic and canvas rendering.
- **configs/**: Game configuration files, including levels and settings.
- **public/**: Static assets like images and sprites.
- **.env.example**: Example environment variables file.

## Dependencies

The project relies on the following dependencies:

```json
{
  "dependencies": {
    "@heroicons/react": "^2.2.0",
    "next": "14.2.5",
    "nipplejs": "^0.10.2",
    "qrcode.react": "^3.1.0",
    "react": "^18",
    "react-dom": "^18",
    "socket.io-client": "^4.7.5",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/uuid": "^10.0.0",
    "eslint": "^8",
    "eslint-config-next": "14.2.5",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

- **@heroicons/react**: For icon components used in the UI.
- **next**: The Next.js framework for server-side rendering and routing.
- **nipplejs**: Joystick library for mobile controls.
- **qrcode.react**: For generating QR codes in React.
- **react** and **react-dom**: Core React libraries.
- **socket.io-client**: For real-time communication between the game and the controller.
- **uuid**: For generating unique session IDs.
- **TypeScript** and related **@types** packages: For type checking and improved code quality.
- **ESLint** and **eslint-config-next**: For linting and maintaining code style.
- **Tailwind CSS** and **PostCSS**: For styling and responsive design.

## Technologies Used

- **React**: For building the user interface.
- **Next.js**: Framework for server-side rendering and routing.
- **TypeScript**: Typed JavaScript for improved code quality.
- **Socket.IO**: Real-time communication between the game and the remote controller.
- **nipplejs**: Joystick library for mobile controls.
- **Canvas API**: For rendering the game graphics.
- **QR Code**: Generating QR codes for mobile device connection.
- **Tailwind CSS**: Utility-first CSS framework for styling.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and make changes as you'd like. Pull requests are warmly appreciated.

## License

This project is licensed under the MIT License

## Acknowledgments

- Inspired by the original **Pac-Man** game.
- **Socket.IO** for enabling real-time communication.
- **nipplejs** for providing joystick controls on mobile devices.
- **Next.js** for the robust React framework.
