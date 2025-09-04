import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { id } = params;
  
  try {
    // Make server-side request to get turbine data
    const response = await fetch(`http://localhost:3000/api/1/windturbines/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        error(404, 'Wind turbine not found');
      }
      error(500, 'Failed to load turbine data');
    }
    
    const turbine = await response.json();
    
    return {
      turbine,
      id
    };
  } catch (err) {
    console.error('Error loading turbine:', err);
    error(500, 'Failed to load turbine data');
  }
};
