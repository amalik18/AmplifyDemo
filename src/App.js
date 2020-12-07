// import logo from './logo.svg';
// import './App.css';
// import React from 'react';
// import { withAuthenticator, AmplifySignOut, AmplifySignIn } from '@aws-amplify/ui-react';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Hello from v2!!!
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//       <AmplifySignOut/>
//     </div>
//   );
// }

// export default withAuthenticator(App);

import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import { API, Storage } from 'aws-amplify';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect( () => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image);
        note.image = image
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }

  async function createNote() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData }});
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([ ...notes, formData ]);
    setFormData(initialFormState);
  }

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }

  async function onChange(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  }

  return (
    <div className="App">
      <h1>
        <strong>My Notes App</strong><br></br>
        <em>by: Ali Malik</em>
      </h1>
      <img src={logo} className="App-logo" alt="logo" style={{height:400, width:400}} class="center"/>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value })}
        placeholder="Note Name"
        value={ formData.name }
        />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value })}
        placeholder="Note Description"
        value={ formData.description }
        />
      <input
        type="file"
        onChange={onChange}
      />
      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
        {
          notes.map(note => (
            <div key={note.id || note.name }>
              <h2>{note.name}</h2>
              <p>{note.description}</p>
              <button onClick={() => deleteNote(note)}>Delete Note</button>
              {
                note.image && <img src={note.image} style={{width:400}} />
              }
            </div>
          ))
        }
      </div>
      <AmplifySignOut />
    </div>
  );
}
//   return (
//     <div className="App">
//       <header>
//         <img src={logo} className="App-logo" alt="logo" />
//         <h1>We now have Auth!</h1>
//       </header>
//       <AmplifySignOut />
//     </div>
//   );
// }

export default withAuthenticator(App);