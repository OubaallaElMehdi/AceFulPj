const BASE_URL = process.env.REACT_APP_GATEWAY_URL || "http://147.79.115.242:8080/vehicleservice/api";

const TrajectoryService = {
    getTrajectoriesByVehicle: async (vehicleId, page = 0, size = 10) => {
        try {
            const response = await fetch(
                `${BASE_URL}/trajectories/vehicle/page/${vehicleId}?page=${page}&size=${size}`,
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

export default TrajectoryService;
