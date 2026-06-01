import { Sierp } from './sierp.js';

const canvas = document.getElementById('sierp');
const ctx = canvas.getContext('2d');
const loading = document.getElementById('loading');
const sidesSpan = document.getElementById('sides');
const iconList = document.querySelector('.icon_list .panel_in');
const resetIconsBtn = document.getElementById('reset_icons');

const sierp = new Sierp(400, 400, 1);
let sides = 7;
let hasCentre = false;
let autoRunning = false;

function startLoad() {
  loading.classList.remove('hidden');
  document.querySelectorAll('.main button').forEach(b => { b.disabled = true; });
}

function stopLoad() {
  loading.classList.add('hidden');
  document.querySelectorAll('.main button').forEach(b => { b.disabled = false; });
}

function updatePoints() {
  sierp.set_points(sides);
  if (hasCentre) sierp.addCentrePoint();
  sidesSpan.textContent = sides;
  sierp.drawPoints(canvas);
}

function clearShape() {
  autoRunning = false;
  stopLoad();
  sierp.reset();
  sierp.drawPoints(canvas);
}

function onStep() {
  startLoad();
  setTimeout(() => run(1), 10);
}

function run(num) {
  for (let i = 0; i < num; i++) sierp.next();
  sierp.render(canvas);
  stopLoad();
}

function autorun() {
  if (!autoRunning) return;
  if (sierp.safe_next()) {
    sierp.render(canvas);
    requestAnimationFrame(autorun);
  } else {
    autoRunning = false;
    stopLoad();
  }
}

function startAuto() {
  autoRunning = true;
  startLoad();
  setTimeout(() => requestAnimationFrame(autorun), 10);
}

function onResultClick(event) {
  document.querySelectorAll('.result').forEach(r => r.classList.remove('active'));
  const result = event.currentTarget;
  result.classList.add('active');
  const img = result.querySelector('img');
  const newImg = new Image();
  newImg.src = img.src;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(newImg, 0, 0, canvas.width, canvas.height);
}

function addIcon(data, name) {
  resetIconsBtn.disabled = false;

  const result = document.createElement('div');
  result.className = 'result';

  const img = document.createElement('img');
  img.className = 'result_img';
  img.src = data;

  const sel = document.createElement('span');
  sel.className = 'sel';
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = name;
  sel.appendChild(label);

  result.appendChild(img);
  result.appendChild(sel);
  result.addEventListener('click', onResultClick);

  iconList.appendChild(result);
  iconList.scrollTop = result.offsetTop;
}

function resetIcons() {
  iconList.innerHTML = '';
  resetIconsBtn.disabled = true;
}

function saveResult() {
  addIcon(canvas.toDataURL(), 'Result');
}

function onCentreClick(event) {
  const btn = event.currentTarget;
  btn.classList.toggle('checked');
  hasCentre = btn.classList.contains('checked');
  updatePoints();
}

function less() {
  sides--;
  if (sides < 2) sides = 2;
  updatePoints();
}

function more() {
  sides++;
  updatePoints();
}

sierp.set_points(sides);
setTimeout(updatePoints, 10);

document.getElementById('next').addEventListener('click', onStep);
document.getElementById('clear').addEventListener('click', clearShape);
document.getElementById('reset_icons').addEventListener('click', resetIcons);
document.getElementById('save').addEventListener('click', saveResult);
document.getElementById('less').addEventListener('click', less);
document.getElementById('auto').addEventListener('click', startAuto);
document.getElementById('more').addEventListener('click', more);
document.querySelector('button.checkbox').addEventListener('click', onCentreClick);
