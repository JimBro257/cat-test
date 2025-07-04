<script setup>
import {ref, onMounted} from 'vue';
import IMG_1 from '@/assets/IMG_2087.png';
import IMG_2 from '@/assets/IMG_2148.png';

const catData = ref(null);
const check1 = ref(false);
const check2 = ref(false);
const check3 = ref(false);
const errorMsg = ref('');
const answerSave = ref('');

const loadSite = async () => {
  try {
    const response = await fetch('http://192.168.178.84:3000/status');
    if(!response.ok) {
      throw new Error('Something went wrong');
    }
    catData.value = await response.json();
    console.log(catData.value)
  } catch (e) {
    errorMsg.value = e;
  }
}
onMounted(loadSite)
const saveClicked = async () => {
  const current = await fetch('http://192.168.178.84:3000/status');
  const currentStatus = await current.json();

  const updatedStatus = {
    morgens: currentStatus.morgens || check1.value,
    mittags: currentStatus.mittags || check2.value,
    abends: currentStatus.abends || check3.value,
  };
  try {
    const response = await fetch('http://192.168.178.84:3000/status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedStatus)
        }
      );
    if(!response.ok) {
      throw new Error('Something went wrong');
    }
    await loadSite();
    answerSave.value = "Daten erfolgreich gespeichert.";
  } catch (e) {
    answerSave.value = e;
  }
}
</script>

<template>
  <div id="cat-images">
    <img id="pic1" alt="Hier wäre ein süßes Bild von Stubentiger 1" :src="IMG_1">
    <img id="pic2" alt="Hier wäre ein mindestens genauso süßes Bild von Stubentiger 2" :src="IMG_2">
  </div>
  <div v-if="catData !== null">
    <div>
      <h1 id="header-text">Der heutige Futter Status:</h1>
    </div>
   <main>
    <div>
      <div v-if="catData.morgens === true">
        <p>Beide Katzen wurden heute Morgen schon gefüttert.</p>
      </div>
      <div v-else>
        <label for="c1">Haben die Katzen heute Morgen etwas zu essen bekommen?</label>
        <input id="c1" type="checkbox" v-model="check1">
      </div>
      <div v-if="catData.mittags === true">
        <p>Beide Katzen wurden heute Mittag schon gefüttert.</p>
      </div>
      <div v-else>
        <label for="c2">Haben die Katzen heute Mittag etwas zu essen bekommen?</label>
        <input id="c2" type="checkbox" v-model="check2">
      </div>
      <div v-if="catData.abends === true">
        <p>Beide Katzen wurden heute Abend schon gefüttert.</p>
      </div>
      <div v-else>
        <label for="c2">Haben die Katzen heute Abend etwas zu essen bekommen?</label>
        <input id="c2" type="checkbox" v-model="check3">
      </div>
      <div v-if="catData.morgens !== true || catData.mittags !== true || catData.abends !== true" id="save-container">
        <button id="save-button" @click="saveClicked">Speichere Auswahl</button>
        <p id="answerSaveP">{{answerSave}}</p>
      </div>
      <div id="answer-div">
        <p v-if="catData.morgens === true && catData.mittags === true && catData.abends === true">Die Katzen wurden heute Morgen, Mittag und Abend gefüttert.</p>
      </div>
    </div>
   </main>
  </div>
  <div id="error" v-else>
    <p>{{errorMsg}}</p>
  </div>
</template>

<style scoped>

#cat-images {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
#cat-images img {
  width: 100%;
  max-width: 250px;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  object-fit: cover;
  transition: transform 0.3s ease;
}
#cat-images img:hover {
  transform: scale(1.05);
}
#header-text {
  text-align: center;
  font-size: 1.8rem;
  color: var(--akzent);
  margin: 1rem 0;
}
main {
  padding: 1rem;
  background: var(--mint);
  border-radius: 1rem;
  max-width: 600px;
  margin: auto;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
}
main p {
  font-size: 1.1rem;
  color: var(--schrift);
  margin-bottom: 0.5rem;
}
label {
  display: block;
  font-weight: bold;
  color: var(--schrift);
  margin-bottom: 0.3rem;
}
input[type="checkbox"] {
  transform: scale(1.4);
  margin: 0.5rem 0 1rem;
  accent-color: var(--akzent);
}
#save-container {
  margin-top: 1.5rem;
  text-align: center;
}
#save-button {
  background-color: var(--lila);
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: bold;
  color: var(--schrift);
  cursor: pointer;
  transition: background-color 0.3s ease;
}
#save-button:hover {
  background-color: var(--blau);
}
#answerSaveP {
  margin-top: 0.5rem;
  color: var(--schrift);
  font-style: italic;
}
#answer-div {
  margin-top: 2rem;
  background-color: var(--gelb);
  padding: 1rem;
  border-radius: 1rem;
  text-align: center;
  font-weight: bold;
  color: var(--schrift);
}
#error {
  text-align: center;
  font-family: sans-serif;
  font-weight: bold;

}
/* Responsive Design */
@media (max-width: 600px) {
  #cat-images {
    flex-direction: column;
    align-items: center;
  }

  main {
    padding: 1rem;
  }

  #header-text {
    font-size: 1.5rem;
  }
}
</style>
