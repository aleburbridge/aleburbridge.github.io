// Grid coordinates as fractions of the 1254x1254 image's natural dimensions.
// The blue-bordered bingo grid starts below the title + BINGO header.
const GRID = {
  left:  0.0400,
  top:   0.14425,
  cellW: 0.1845,
  cellH: 0.1622,
  cols: 5,
  rows: 5,
};

function getMarked() {
  try {
    return JSON.parse(localStorage.getItem('birdbingo') || '[]');
  } catch {
    return [];
  }
}

function saveMarked(arr) {
  localStorage.setItem('birdbingo', JSON.stringify(arr));
}

function cellFromPoint(x, y, W, H) {
  const col = Math.floor((x - GRID.left * W) / (GRID.cellW * W));
  const row = Math.floor((y - GRID.top  * H) / (GRID.cellH * H));
  if (col < 0 || col >= GRID.cols || row < 0 || row >= GRID.rows) return null;
  return { col, row, index: row * GRID.cols + col };
}

function draw(canvas, marked, hovered) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const cellW = GRID.cellW * W;
  const cellH = GRID.cellH * H;

  for (let row = 0; row < GRID.rows; row++) {
    for (let col = 0; col < GRID.cols; col++) {
      const idx = row * GRID.cols + col;
      const x = (GRID.left + col * GRID.cellW) * W;
      const y = (GRID.top  + row * GRID.cellH) * H;

      if (hovered && hovered.col === col && hovered.row === row) {
        ctx.fillStyle = 'rgba(255, 220, 0, 0.28)';
        ctx.fillRect(x, y, cellW, cellH);
      }

      if (marked.includes(idx)) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.fillRect(x, y, cellW, cellH);

        const pad = cellW * 0.13;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.88)';
        ctx.lineWidth = Math.max(5, W * 0.007);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + pad,        y + pad);
        ctx.lineTo(x + cellW - pad, y + cellH - pad);
        ctx.moveTo(x + cellW - pad, y + pad);
        ctx.lineTo(x + pad,        y + cellH - pad);
        ctx.stroke();
      }
    }
  }
}

function canvasPoint(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top)  * scaleY,
  };
}

function init() {
  const img = document.querySelector('.bingo-card');
  if (!img) return;

  const container = document.createElement('div');
  container.style.cssText = 'position:relative;display:inline-block;';
  img.parentNode.insertBefore(container, img);
  container.appendChild(img);
  img.style.display = 'block';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;cursor:pointer;';
  container.appendChild(canvas);

  let marked = getMarked();
  let hovered = null;

  function sync() {
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    draw(canvas, marked, hovered);
  }

  canvas.addEventListener('mousemove', (e) => {
    const pt = canvasPoint(e, canvas);
    hovered = cellFromPoint(pt.x, pt.y, canvas.width, canvas.height);
    draw(canvas, marked, hovered);
  });

  canvas.addEventListener('mouseleave', () => {
    hovered = null;
    draw(canvas, marked, null);
  });

  canvas.addEventListener('click', (e) => {
    const pt = canvasPoint(e, canvas);
    const cell = cellFromPoint(pt.x, pt.y, canvas.width, canvas.height);
    if (!cell) return;
    const i = cell.index;
    marked = marked.includes(i) ? marked.filter(v => v !== i) : [...marked, i];
    saveMarked(marked);
    draw(canvas, marked, hovered);
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const pt = canvasPoint(e, canvas);
    const cell = cellFromPoint(pt.x, pt.y, canvas.width, canvas.height);
    if (!cell) return;
    const i = cell.index;
    marked = marked.includes(i) ? marked.filter(v => v !== i) : [...marked, i];
    saveMarked(marked);
    draw(canvas, marked, null);
  }, { passive: false });

  if (img.complete && img.naturalWidth) {
    sync();
  } else {
    img.addEventListener('load', sync);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
