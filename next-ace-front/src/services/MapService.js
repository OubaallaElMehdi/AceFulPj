const BASE_URL = process.env.REACT_APP_GATEWAY_URL || "http://147.79.115.242:8080";

const MapService = {
    getVehicles: async () => {
        try {
            const response = await fetch(`${BASE_URL}/vehicleservice/vehicles/all`, {
                method: "GET",
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch vehicles");
            }
            return response.json();
        } catch (error) {
            throw new Error(error.message || "Failed to fetch vehicles");
        }
    },

    getTrajectoriesByCarAndDate: async (vehicleId, date) => {
        try {
            const response = await fetch(
                `http://147.79.115.242:8081/api/trajectories/vehicle/${vehicleId}/date/${date}`,
                {
                    method: "GET",
                }
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch trajectories");
            }
            return response.json();
        } catch (error) {
            throw new Error(error.message || "Failed to fetch trajectories");
        }
    },
};

export default MapService;
