// Constantes para la conversión de días/semanas
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30; // Usamos 30 días como aproximación
const DAYS_IN_YEAR = 365;

// Variables globales para guardar el estado
let currentStep = 1; // El paso actual
let income = 0; // Guardará el ingreso mensual del Paso 1
let expenseIdCounter = 0; // Contador para dar IDs únicos a cada gasto

// ----------------------------------------------------------------------
// 1. FUNCIONALIDAD PRINCIPAL: NAVEGACIÓN Y VALIDACIÓN
// ----------------------------------------------------------------------

// Función principal para cambiar de paso
function nextStep(current) {
    // 1. Validar el paso actual antes de avanzar
    if (current === 1) {
        if (!validateStep1()) return; // Si la validación falla, sale de la función
    } else if (current === 2) {
        if (!validateStep2()) return;
        calculateResults(); // Si avanza del Paso 2, calcula los resultados
    }

    // 2. Ocultar el paso actual
    document.getElementById(`step-${current}`).classList.remove('active-step');
    
    // 3. Determinar el siguiente paso
    currentStep = current + 1;
    if (currentStep > 3) {
        currentStep = 1; // Podríamos volver al inicio si es necesario
    }

    // 4. Mostrar el siguiente paso
    document.getElementById(`step-${currentStep}`).classList.add('active-step');
}

// Validación del Paso 1: Ingreso Mensual
function validateStep1() {
    const incomeInput = document.getElementById('monthly-income');
    const value = parseFloat(incomeInput.value);

    // Comprueba si el valor no es un número o es menor o igual a cero
    if (isNaN(value) || value <= 0) {
        alert("Por favor, ingresa un valor de Ingreso Mensual válido y mayor que cero.");
        incomeInput.focus();
        return false;
    }
    
    income = value; // Guarda el ingreso mensual
    return true;
}

// Validación del Paso 2: Gastos
function validateStep2() {
    const expenseInputs = document.querySelectorAll('.expense-input');
    
    if (expenseInputs.length === 0) {
        alert("Por favor, agrega al menos un gasto diario.");
        return false;
    }

    let allValid = true;
    expenseInputs.forEach(input => {
        const value = parseFloat(input.value);
        // Comprueba que cada campo de gasto sea válido y positivo
        if (isNaN(value) || value < 0) {
            alert("Por favor, revisa que todos los gastos sean números válidos.");
            input.focus();
            allValid = false;
        }
    });
    return allValid;
}


// ----------------------------------------------------------------------
// 2. FUNCIONALIDAD DEL PASO 2: GASTOS DINÁMICOS Y CÁLCULOS INTERMEDIOS
// ----------------------------------------------------------------------

// Crea la estructura HTML para un nuevo campo de gasto
function createExpenseItem(id, initialLabel = "Gasto diario") {
    const div = document.createElement('div');
    div.classList.add('expense-item');
    div.dataset.id = id; // Almacena el ID único en el elemento HTML

    div.innerHTML = `
        <span class="expense-icon" title="${initialLabel}"></span>
        <div class="expense-item-content">
            <div class="expense-input-wrapper">
                <input type="number" 
                       placeholder="${initialLabel}" 
                       class="expense-input" 
                       oninput="updateTotals();" 
                       min="0"
                       required>
                <span class="delete-btn" onclick="removeExpenseItem(${id});"></span>
            </div>
        </div>
    `;
    return div;
}

// Añade el primer gasto al inicio del Paso 2
function addInitialExpense() {
    const container = document.getElementById('expenses-container');
    expenseIdCounter++;
    container.appendChild(createExpenseItem(expenseIdCounter, "Gasto diario (ej. Café, cigarros)"));
}

// Función para agregar un nuevo campo de gasto
function addExpense() {
    const container = document.getElementById('expenses-container');
    expenseIdCounter++;
    container.appendChild(createExpenseItem(expenseIdCounter, "Otro gasto diario"));
    container.lastElementChild.querySelector('.expense-input').focus();
}

// Función para eliminar un campo de gasto
function removeExpenseItem(id) {
    const item = document.querySelector(`.expense-item[data-id="${id}"]`);
    if (item) {
        item.remove();
        updateTotals(); // Recalcula los totales después de eliminar
    }
}

// Función para calcular y actualizar los totales de gastos (Semanal, Mensual, Anual)
function updateTotals() {
    let totalDaily = 0;
    const expenseInputs = document.querySelectorAll('.expense-input');

    // Suma todos los gastos diarios ingresados
    expenseInputs.forEach(input => {
        totalDaily += parseFloat(input.value) || 0;
    });

    // Cálculos de totales
    const totalWeekly = totalDaily * DAYS_IN_WEEK;
    const totalMonthly = totalDaily * DAYS_IN_MONTH; 
    const totalAnnual = totalDaily * DAYS_IN_YEAR;

    // Formateador de moneda (ajusta 'USD' a tu moneda local: 'CLP', 'MXN', 'COP', etc.)
    const formatter = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP', 
        minimumFractionDigits: 0, // No mostrar decimales
    });

    // Actualiza los elementos HTML del resumen
    document.getElementById('total-weekly-2').textContent = formatter.format(totalWeekly);
    document.getElementById('total-monthly-2').textContent = formatter.format(totalMonthly);
    document.getElementById('total-annual-2').textContent = formatter.format(totalAnnual);
    
    // Almacena el total mensual de gastos en una variable global para el Paso 3
    window.totalMonthlyExpenses = totalMonthly;
}


// ----------------------------------------------------------------------
// 3. FUNCIONALIDAD DEL PASO 3: CÁLCULO DE RESULTADOS Y GRÁFICO
// ----------------------------------------------------------------------

function calculateResults() {
    const totalExpenses = window.totalMonthlyExpenses || 0;
    
    // Cálculo de porcentaje: Gasto respecto al Ingreso
    const percentage = (totalExpenses / income) * 100;
    const roundedPercent = percentage.toFixed(0);

    // Actualizar el porcentaje en el HTML
    document.getElementById('result-percent').textContent = `${roundedPercent}%`;

    // Lógica para determinar el mensaje de la hormiga según el porcentaje
    let resultTitle = 'Hormiga Ahorradora';
    let resultMessage = '¡Felicidades! Tus gastos hormiga están bajo control.';
    let resultColor = '#E91E63'; // Color base

    if (percentage > 50) {
        resultTitle = 'Gastadora Moderada';
        resultMessage = '¡Atención! Tus gastos hormiga son significativos.';
        resultColor = '#FF9800'; // Naranja
    }
    if (percentage > 100) {
        resultTitle = 'Gastadora Extrema';
        resultMessage = '¡Fumiga estos gastos! Tus gastos hormiga están elevados.';
        resultColor = 'red'; // Rojo
    }
    
    // Actualizar texto y color del resultado
    document.getElementById('result-title').textContent = resultTitle;
    document.getElementById('result-message').textContent = resultMessage;
    document.querySelector('.result-percentage').style.color = resultColor;

    // Generar el gráfico
    updatePieChart(totalExpenses, income, resultColor);
}

// Función para simular el gráfico circular (Pie Chart) usando CSS 'conic-gradient'
function updatePieChart(expenses, income, expenseColor) {
    const chart = document.getElementById('pie-chart');
    const incomeColor = '#E91E63'; // Color del ingreso

    // Calcula el ángulo del gasto. Se limita a 360 grados (100% visible del círculo)
    const expenseAngle = Math.min(expenses / income, 1) * 360; 
    const incomeAngle = 360 - expenseAngle; 

    // Genera el degradado cónico para simular el gráfico
    chart.style.background = `conic-gradient(
        ${incomeColor} 0deg ${incomeAngle}deg,
        ${expenseColor} ${incomeAngle}deg 360deg
    )`;
    
    // Si el gasto supera el ingreso, el gráfico será 100% del color del gasto
    if (expenses > income) {
         chart.style.background = `${expenseColor}`;
    }
    
    // Asegura que el punto de la leyenda tenga el mismo color que el gasto en el gráfico
    document.querySelector('.expense-dot').style.backgroundColor = expenseColor;
}


// ----------------------------------------------------------------------
// 4. INICIALIZACIÓN
// ----------------------------------------------------------------------

// Se ejecuta una vez que la página está completamente cargada
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa la funcionalidad de cambio de pestañas (solo visual, sin cambiar el contenido)
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remueve la clase 'active' de la pestaña anterior
            document.querySelector('.tab.active')?.classList.remove('active');
            // Añade la clase 'active' a la pestaña clickeada
            this.classList.add('active');
        });
    });

    // Agrega el primer campo de gasto al inicio del Paso 2
    addInitialExpense();
    
    // Conecta el botón "+ agregar otro" a la función de agregar gasto
    document.getElementById('add-expense-btn').addEventListener('click', function(e) {
        e.preventDefault(); 
        addExpense();
    });

    // Inicializa los totales del Paso 2 a cero
    updateTotals();
});