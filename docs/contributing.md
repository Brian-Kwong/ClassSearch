## Contributing

Thank you for considering contributing to this project! We welcome contributions from the community to help improve and enhance the project. Whether it's fixing bugs, adding support for new institutions, or suggesting new features, your input is extremely valuable.

If you interested on working on this project or just to prefer to compile the application from source, please follow the steps below:

1. **Fork the Repository**: Start by forking the repository on GitHub to create your own copy of the project.
   Then clone your forked repository to your local machine using Git. You can do this by running the following command in your terminal:

```bash
git clone https://github.com/yourusername/CSUClassSearch.git
```

Alternatively use a GUI Git client of your choice to pull the repository to your local machine.

2. **Set Up the Development Environment**: Ensure you have Node.js and npm installed on your machine. You can download them from [nodejs.org](https://nodejs.org/).

For macOS you also need XCode Command Line Tools. You can install it by running the following command in your terminal:

```zsh
xcode-select --install
```

On Windows, you may need to install additional build tools. You can do this by running:

```powershell
npm install --global --production windows-build-tools
```

For Linux, ensure you have the necessary build tools installed. For example, on Ubuntu, you can run:

```bash
sudo apt-get install build-essential
```

3. **Install Dependencies**: Navigate to the project directory and install the required dependencies using npm:

```bash
cd CSUClassSearch
npm install
```

4. **Run the Application**: You can start the application in development mode with the following command:

```bash
npm run dev
```

This will launch the application and you can access it should automatically open the application. On first run this might take a few minutes as it compiles the source code and installs necessary components to your system.

5. **Make Changes**: You can now make changes to the source code. Feel free to explore the codebase and modify it as needed. As the project is built using [Vite](https://vitejs.dev/) and [Electron](https://www.electronjs.org/), changes made in the React part of the codebase should hot-reload automatically. However, changes to the Electron main process may require a restart of the application as it recompile the main process TypeScript code.

If you add additional electron files you will need to add the files to `tsconfig.electron.json` to ensure they are added to the compilation.

6. **Test Your Changes**: Before submitting your changes, make sure to test them thoroughly to ensure they work as expected and do not introduce any new issues.

> [!NOTE]
> Currently there are no automated tests for this project. Please ensure to manually test your changes. Automated tests will be added in the future releases.
