const csvParse = require('csv-parse/lib/sync');
const csvStringify = require('csv-stringify/lib/sync');

class CsvService {

  addColumn(content, columnName, columnValueGenerator) {
    const data = csvParse(content, { columns: true, delimiter: ';', trim: true });
    for (const row of data) {
      row[columnName] = columnValueGenerator(row);
    }
    const csv = csvStringify(data, { header: true, delimiter: ';' });
    return csv;
  }

  fillEmptyColumns(content, value) {
    const data = csvParse(content, { columns: true, delimiter: ';', trim: true  });
    for (const row of data) {
      for (const columnName of Object.keys(row)) {
        if (row[columnName].length === 0) {
          row[columnName] = value;
        }
      }
    }
    const csv = csvStringify(data, { header: true, delimiter: ';' });
    return csv;
  };

  filterRows(content, filterFunction) {
    const data = csvParse(content, { columns: true, delimiter: ';', trim: true  });
    const filteredData = data.filter(filterFunction);
    const csv = csvStringify(filteredData, {  header: true, delimiter: ';' });
    return csv;
  }
}

module.exports = new CsvService();