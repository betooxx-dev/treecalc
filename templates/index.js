let display = document.getElementById("display");
let currentNumber = "";
let memory = 0;
let lastResult = null;

function addToDisplay(value) {
  if (value === "C") {
    clearDisplay();
    return;
  }

  if (value === "backspace") {
    let displayText = display.innerText;
    if (displayText.length > 1) {
      display.innerText = displayText.slice(0, -1);
      currentNumber = currentNumber.slice(0, -1);
    } else {
      display.innerText = "0";
      currentNumber = "";
    }
    return;
  }

  // Memory operations
  if (value === "MS") {
    saveToMemory();
    return;
  }

  if (value === "MR") {
    recallMemory();
    return;
  }

  if (value === "MC") {
    clearMemory();
    return;
  }

  // Handle number and operator input
  if ("0123456789.".includes(value)) {
    if (lastResult !== null) {
      display.innerText = value;
      lastResult = null;
    } else {
      if (display.innerText === "0" && value !== ".") {
        display.innerText = value;
      } else {
        display.innerText += value;
      }
    }
    currentNumber += value;
  } else {
    // Handle operators
    lastResult = null;
    currentNumber = "";
    if (display.innerText === "0" && value !== ".") {
      display.innerText = value;
    } else {
      display.innerText += value;
    }
  }

  animateDisplay();
}

function saveToMemory() {
  memory = parseFloat(display.innerText);
  fetch("/memory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ operation: "MS", value: memory }),
  });
  animateDisplay();
}

function recallMemory() {
  fetch("/memory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ operation: "MR" }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        display.innerText = "Error";
      } else {
        // Si el display está en 0 o es el último resultado, reemplazar
        if (display.innerText === "0" || lastResult !== null) {
          display.innerText = data.result;
        } else {
          // Si termina en un operador o está en medio de una operación, agregar el número
          const lastChar = display.innerText.slice(-1);
          if (["+", "-", "×", "/", "("].includes(lastChar)) {
            display.innerText += data.result;
          } else {
            // Si estamos en medio de un número, agregar el operador + y el número de memoria
            display.innerText += "+" + data.result;
          }
        }
        currentNumber = data.result.toString();
        lastResult = null;
        animateDisplay();
      }
    });
}

function clearMemory() {
  fetch("/memory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ operation: "MC" }),
  }).then(() => {
    memory = 0;
  });
}

function animateDisplay() {
  display.style.transform = "scale(1.02)";
  setTimeout(() => {
    display.style.transform = "scale(1)";
  }, 100);
}

function clearDisplay() {
  display.innerText = "0";
  currentNumber = "";
  lastResult = null;
  clearTokensAndTree();
}

function updateTokenTable(tokens, tokenCount) {
  const tokenTable = d3.select("#token-table");
  tokenTable.selectAll("*").remove();

  // Create table
  const table = tokenTable.append("table");

  // Add headers
  const header = table.append("thead").append("tr");
  header.append("th").text("Token");
  header.append("th").text("Tipo");

  // Add rows
  const tbody = table.append("tbody");
  tbody
    .selectAll("tr")
    .data(tokens)
    .enter()
    .append("tr")
    .html(
      (d) => `
            <td>${d.token}</td>
            <td>${d.tipo}</td>
        `
    );

  // Update token count
  const countDiv = d3.select("#token-count");
  countDiv.html(`
        <div class="token-count-item">
            <span class="count-label">Total números enteros:</span>
            <span class="count-value">${tokenCount.numbers}</span>
        </div>
        <div class="token-count-item">
            <span class="count-label">Total operadores:</span>
            <span class="count-value">${tokenCount.operators}</span>
        </div>
    `);
}

function drawTree(treeData) {
  d3.select("#tree-container").selectAll("*").remove();

  if (!treeData) return;

  const container = document.getElementById("tree-container");
  const width = container.clientWidth;
  const height = container.clientHeight;
  const margin = { top: 40, right: 40, bottom: 40, left: 40 };

  const svg = d3
    .select("#tree-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const treeLayout = d3
    .tree()
    .size([
      height - margin.top - margin.bottom,
      width - margin.left - margin.right,
    ]);

  const root = d3.hierarchy(treeData);
  treeLayout(root);

  svg
    .selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr(
      "d",
      d3
        .linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x)
    )
    .style("opacity", 0)
    .transition()
    .duration(500)
    .style("opacity", 1);

  const nodes = svg
    .selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d) => `translate(${d.y},${d.x})`)
    .style("opacity", 0);

  nodes
    .append("circle")
    .attr("r", 20)
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(200).attr("r", 25);
    })
    .on("mouseout", function (event, d) {
      d3.select(this).transition().duration(200).attr("r", 20);
    });

  nodes
    .append("text")
    .attr("dy", ".35em")
    .attr("x", (d) => (d.children ? -30 : 30))
    .attr("text-anchor", (d) => (d.children ? "end" : "start"))
    .text((d) => d.data.value)
    .style("cursor", "default");

  nodes
    .transition()
    .duration(500)
    .delay((d, i) => i * 100)
    .style("opacity", 1);
}

function calculate() {
  const expression = display.innerText;

  fetch("/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expression: expression }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        display.innerText = "Error";
        clearTokensAndTree();
      } else {
        display.innerText = data.result;
        lastResult = data.result;
        drawTree(data.tree);
        updateTokenTable(data.tokens, data.token_count);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      display.innerText = "Error";
      clearTokensAndTree();
    });
}

function clearTokensAndTree() {
  d3.select("#tree-container").selectAll("*").remove();
  d3.select("#token-table").selectAll("*").remove();
  d3.select("#token-count").html("");
}

// Handle keyboard input
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (key === "Enter") {
    calculate();
  } else if (key === "Backspace") {
    addToDisplay("backspace");
  } else if (key === "Escape") {
    clearDisplay();
  } else if (/^[0-9+\-*/().=]$/.test(key)) {
    addToDisplay(key);
  }
});

// Responsive handling with debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.addEventListener(
  "resize",
  debounce(() => {
    const expression = display.innerText;
    if (expression !== "0" && expression !== "Error") {
      calculate();
    }
  }, 250)
);

// Initialize calculator
document.addEventListener("DOMContentLoaded", () => {
  clearDisplay();
});
