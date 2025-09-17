

export default {

    getLocationFromName: async function (name) {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&&addressdetails=3&q=${name}&limit=5`;

        try {
            let response = await fetch(url, {
                method: "GET",
            }).then((res)=> res.json());

            return response;
            // if (response.length > 0) {
            //     return response;
            // } else {
            //     console.error('No maching data found');
            //     return { address: 'N/A', city: 'N/A' };
            // }
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.error('Rate limit exceeded. Try again later.');
            } else {
                console.error(`Error: ${error}`);
            }
            return { address: 'N/A', city: 'N/A' };
        }
    }


}