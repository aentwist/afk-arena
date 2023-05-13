<template>
  <span>How much stamina on LOWEST stamina unit in team? </span
  ><input type="number" value="0" id="stamina" />
  <br />
  <br />
  <span>Are you a star of dawn?</span><input type="checkbox" id="is-sod" />
  <br />
  <br />
  <span>Quiet time start: </span
  ><input id="end-day" type="date" value="2023-05-22" />
  <br />
  <br />
  <span id="results"></span>
</template>

<script setup lang="ts">
const staminaEle = document.getElementById("stamina");
const isSodEle = document.getElementById("is-sod");
const endDayEle = document.getElementById("end-day");
const resultsEle = document.getElementById("results");

const onChange = () => {
  const endTime = new Date(endDayEle.value);
  const hoursLeft = (endTime - new Date()) / 1000 / 60 / 60;
  const staminaGain = isSodEle.checked ? 4 * (1.12 + 0.1) : 4 * 1.12;
  const staminaToGain = hoursLeft > 0 ? staminaGain * hoursLeft : 0;
  const totalStamina = Math.floor(staminaToGain + +staminaEle.value);
  const remainingFullAttacks = Math.floor(totalStamina / 48);
  const residualStamina = totalStamina % 48;
  const freeRewinds = Math.floor(residualStamina / 4);
  resultsEle.innerText = `
        Hours left: ${Math.floor(hoursLeft * 100) / 100}
        Your team will be able to attack ${remainingFullAttacks} times, using ${
    remainingFullAttacks * 48
  } stamina
        You will end up with ${totalStamina} stamina at the beginning of quiet timer.
        You can therefore rewind ${freeRewinds} times without losing an attack!
     `;
};

staminaEle.oninput = onChange;
isSodEle.onchange = onChange;
endDayEle.onchange = onChange;
</script>
