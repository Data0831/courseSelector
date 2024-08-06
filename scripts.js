function generateTable(row, col) {
    let table = document.createElement('table');
    for (let i = 0; i < row; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < col; j++) {
            let td = document.createElement('td');
            td.textContent = `(${i+1}, ${j+1})`;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    document.body.appendChild(table);
}

generateTable(5, 3);