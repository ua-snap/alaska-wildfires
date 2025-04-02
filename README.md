# Alaska Wildfires

This Git repository contains code and data related to viewing and analyzing wildfires and associated map layers in Alaska. The repository provides tools and resources to monitor and study wildfire incidents in the region.

## Installation

To install and run this project locally, follow these steps:

1. Clone the repository to your local machine using the following command:

   ```
   git clone https://github.com/username/alaska-wildfires.git
   ```

2. Navigate to the project directory:

   ```
   cd alaska-wildfires
   ```

3. Install the required dependencies:

   ```
   npm install
   ```

4. Start the application:

   ```
   npm run dev
   ```

## Usage

Once the application is running, you can access it by opening your web browser and navigating to `http://localhost:8080`. From there, you can explore the wildfire incidents and view detailed information regarding other available layers related to wildfires in Alaska.

The app depends on an upstream API. The location of this API can be changed by setting an environment variable: `export VUE_APP_SNAP_API_URL=http://development.earthmaps.io/` as required.

The file `src/assets/status.json` is intended to be updated by an external process (Prefect) which handling the data assimilation and backend updates. The version checked into the repository is suitable for testing.

### Offline mode

To set the app into "winter mode", export this env var:

`export VUE_APP_ACTIVE=False`

### Playwright tests

To run the Playwright tests for this webapp, first run the webapp:

```
npm run dev
```

Then, in another terminal window, run the following

```
npx playwright install # Install Playwright browsers
npx playwright test --ui
```

## Building the repository for production

This repository uses AWS CLI tools to pull the latest version of the status.json file from the production version of the application before building the application. This means that the status.json will match the last time data was updated using our Prefect update scripts.

To use the build command, be sure you have [AWS CLI Toolkit](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed. Then you can run:

```
npm run build
```

## License

This project is licensed under the [MIT License](LICENSE).
