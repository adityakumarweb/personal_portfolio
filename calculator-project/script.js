let currentOperand = '';
let previousOperand = '';
let operation = undefined;

const currentTextElement = document.getElementById('current-operand');
const previousTextElement = document.getElementById('previous-operand');

function appendNumber(number) {
    if (number === '.' && currentOperand.includes('.')) return;
    if (currentOperand.length > 12) return;
    currentOperand = currentOperand.toString() + number.toString();
    updateDisplay();
}

function chooseOperator(op) {
    if (currentOperand === '') return;
    if (previousOperand !== '') {
        compute();
    }
    operation = op;
    previousOperand = currentOperand;
    currentOperand = '';
    updateDisplay();
}

function compute() {
    let computation;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (operation) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '×':
            computation = prev * current;
            break;
        case '÷':
            if (current === 0) {
                alert("Cannot divide by zero");
                clearDisplay();
                return;
            }
            computation = prev / current;
            break;
        default:
            return;
    }
    
    currentOperand = computation.toString();
    operation = undefined;
    previousOperand = '';
    updateDisplay();
}

function clearDisplay() {
    currentOperand = '0';
    previousOperand = '';
    operation = undefined;
    updateDisplay();
    currentOperand = ''; // Reset after showing 0
}

function deleteNumber() {
    currentOperand = currentOperand.toString().slice(0, -1);
    updateDisplay();
}

function updateDisplay() {
    currentTextElement.innerText = currentOperand || '0';
    if (operation != null) {
        previousTextElement.innerText = `${previousOperand} ${operation}`;
    } else {
        previousTextElement.innerText = '';
    }
}
