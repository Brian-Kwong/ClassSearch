# Frequently Asked Questions (FAQ)

This section addresses some common technical and usage questions ClassSearch users may have. If you have a question that isn't covered here, please feel free to reach out via the [GitHub Issues](https://github.com/Brian-Kwong/CSUClassSearch/issues) page.

Last updated: _September 2025_

## 1. When downloading the app, my browser warns me that the file is dangerous. Why is that and is it safe to proceed?

When downloading the app, your browser may flag the file as potentially dangerous because it is not signed with a recognized certificate authority (CA) that is trusted by your operating system and/or browser. This is a common occurrence for applications that are distributed outside of major app stores or platforms, and especially for new open-source projects. While this warning is standard for unsigned applications, we understand that it can be concerning. and want to assure you that the application is safe to use. If you have any doubts, please feel free to review the source code on the [GitHub repository](https://github.com/Brian-Kwong/CSUClassSearch). If you are using Windows you can also soon get the application through the Microsoft Store, which will eliminate this warning. For macOS users, we are in the process of obtaining an Apple Developer ID to sign the application, which will also help mitigate these warnings in future releases. Linux users should not encounter this warning as most distributions do not enforce application signing.

## 2. Why does it seem like sometimes a blank window opens for a second when I perform a request?

When you perform a request, the app generally tries to perform a request using the native Node.js `fetch` API. However, if your institution has timed out or detects unusual activity, it may redirect you to their login page even if your session cookies are still valid. In these cases the application will open a headless browser window with the current session to reauthenticate you. If your session is still valid this request should resolve quickly and automatically resulting in that brief flash of a blank window. If your session has expired, you will be redirected by your institution's to re-login. After you successfully re-login, the app will complete your original request.

## 3. Why do I have to re-login every time I open the app?

As discussed in [Why do I need to log in with my institution's authentication?](#_6-why-do-i-need-to-log-in-with-my-institution-s-authentication), your login credentials are never stored (locally or remotely) nor sent to our servers. Additionally, institutions keep their session cookies, for that session only, to maintain a secure environment and prevent common security vulnerabilities. For that reason, your session and associated cookies are destroyed when you close the app. If you like to remain logged in, we suggest you keep the app open but minimized in your taskbar or system tray.

> [!NOTE]
> Your institution's authentication service may have its own session timeout policies, which could require you to log in again after a certain period of inactivity.

## 4. Why isn't this a website?

While originally intended to be a website, the technical limitations of web browsers, particularly around CORS (Cross-Origin Resource) policies and the way most institutions structure their authentication, made it challenging to implement as a traditional web application while maintaining our desired features and user privacy standards. By bundling the application as a desktop app we handle all requests locally and create a more seamless, robust and secure experience.

## 5. Why Electron?

Electron opens the access of a full Node.js server for our backend operations of processing courses with flexible and powerful integration with your institution's authentication services, while maintaining a secure environment for accessing protected API endpoints. It is also a mature and widely adopted framework with a strong community and extensive documentation/usage. While newer frameworks like Tauri are promising, they are still in their infancy and lack the flexibility and maturity that Electron provides particularly in the way that Tauri handles sessions passing between different parts of the application for course requests to your institution's authentication services.

## 6. Why do I need to log in with my institution's authentication?

Most institutions protect their course data to only be accessible to their students and staff. By logging in with your institution's authentication, you gain full access to the course data your institution provides you, as if you were viewing it through your institution's official course register. This ensures that you have access to the most accurate and up-to-date information about courses, including availability, prerequisites, and other important details. Your login credentials are never stored (locally or remotely) nor sent to our servers or any third party; Your institution's authentication service handles the login process directly and maintains your session on their servers. To learn more about how your data is handled, please refer to our [Privacy Policy](/privacy-policy).

## 7. How do I clear my search history and preferences?

You can delete any locally stored data such as your search history and preferences by navigating to the [settings page](./settings.md) within the application and selecting the `Clear Cache` option under `Cache Settings`.

## 8. How do I report a bug or request a feature?

If you encounter any bugs or have feature requests, please submit an issue on our [GitHub repository](https://github.com/Brian-Kwong/CSUClassSearch/issues).

## 9. How can I contribute to the project?

Of course! We welcome contributions from the community. You can fork the repository, make your changes, and submit a pull request. Please refer to our [Contributing Guidelines](./contributing.md) for more details on how to get started contributing or compiling the project from source.

## Logo Attribution

This logo is a derivative and modified version of an original vector created by [A. S. M. Rajib on Vecteezy](https://www.vecteezy.com/free-vector/student-drawing) titled `Student Drawing Vectors` and is used under the [Creative Commons (CC BY 3.0)](https://creativecommons.org/licenses/by/3.0/) license.
