const getButton = document.querySelector('.get-button');
const createButton = document.querySelector('.create-button');

getButton.addEventListener('click', () => {
  const index = document.querySelector('.get-input').value;
  const query = `query GetUser($index: ID!) {
    getUser(index: $index) {
      name
      age
    }
  }`;

  fetch('http://localhost:4000/graphql', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { index },
    }),
  })
    .then((res) => res.json())
    .then((data) => console.log('data returned:', data))
    .catch((err) => console.log(err));
});

createButton.addEventListener('click', () => {
  const name = document.querySelector('.name-input').value;
  const age = Number(document.querySelector('.age-input').value);
  const query = `mutation CreateUser($input: UserInput) {
    createUser(userInput: $input) {
      name
      age
    }
  }`;

  fetch('http://localhost:4000/graphql', {
    method: 'post',
    headers: {
      'content-type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          name,
          age,
        },
      },
    }),
  })
    .then((res) => res.json())
    .then((data) => console.log('data returned:', data))
    .catch((err) => console.log(err));
});
