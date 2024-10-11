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

## License

This project is licensed under the [MIT License](LICENSE).
