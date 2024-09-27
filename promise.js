
fetch('https://jsonplaceholder.typicode.com/posts')
  .then((response) => {
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return response.json();
  })
  .then((data) => {
    
    console.log('Data fetched successfully:', data);
  })
  .catch((error) => {
    
    console.error('Error fetching data:', error);
  });
