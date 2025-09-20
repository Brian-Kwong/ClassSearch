# Getting Started

Class search is a interactive desktop application that empowers you to search for classes at your university. It uses the same backend API as your institution allowing for up-to date information on offered courses and live seat availability. With advanced filtering options, you can easily find classes that fit your schedule and take the stress out of registration.

**Note**: This application is currently in active development and is currently in beta. While the core functionality is functional and tested, you may still encounter bugs or incomplete features. Please report any issues you find on the [GitHub Issues Page](https://github.com/Brian-Kwong/CSUClassSearch/issues). Thank you for your understanding and support!

## Compatible Universities

The original scope of this project is to support the California State University (CSU) system as the all share the underlying Oracle PeopleSoft:tm: infrastructure and API endpoints. However as the course database require an active login session, I've only verified the application with `CP SLO`. Please check the table below for the current status of supported universities. If you would like to see your university supported, please open an issue or submit a pull request with the necessary configuration.

As the project develops, I plan to add support for more universities systems given they feature similar architectures of their course search infrastructure.

|               University                | Abbreviation |    Status    |
| :-------------------------------------: | :----------: | :----------: |
| California Polytechnic State University |   Cal Poly   | Fully Tested |
| California State University, Long Beach |    CSULB     | In Progress  |
| California State University, Fullerton  |     CSUF     | In Progress  |
