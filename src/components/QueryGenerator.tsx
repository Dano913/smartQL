import React, { useState, useEffect } from 'react';
import { Copy, Check, Database, Sparkles } from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/github.css';
import DataPreview from './DataPreview';
import QueryOptions from './QueryOptions';

hljs.registerLanguage('sql', sql);

interface QueryGeneratorProps {
  excelData: any[];
  fileName: string;
  headers: string[];
}

type ColumnType =
  | 'VARCHAR(255)'
  | 'INT'
  | 'DECIMAL(10,2)'
  | 'DATE'
  | 'TEXT'
  | 'BOOLEAN';

interface ColumnConfig {
  name: string;
  include: boolean;
  type: ColumnType;
  alias?: string;
  addColumn?: boolean;
}

const QueryGenerator: React.FC<QueryGeneratorProps> = ({
  excelData,
  fileName,
  headers,
}) => {
  const [tableName, setTableName] = useState('');
  const [tableNameError, setTableNameError] = useState(false);

  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(() => {
    return headers.map((header) => ({
      name: header,
      include: true,
      type: guessColumnType(header, excelData),
      addColumn: false,
    }));
  });

  const [queryType, setQueryType] = useState<'INSERT' | 'CREATE' | 'UPDATE'>(
    'CREATE'
  );
  const [whereColumn, setWhereColumn] = useState<string>(headers[0] || '');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [copied, setCopied] = useState(false);

  function guessColumnType(header: string, data: any[]): ColumnType {
    const sampleSize = Math.min(10, data.length);
    const samples = data
      .slice(0, sampleSize)
      .map((row) => row[header])
      .filter((value) => value !== null && value !== undefined && value !== '');

    if (samples.length === 0) return 'VARCHAR(255)';

    const allNumbers = samples.every((value) => !isNaN(Number(value)));
    if (allNumbers) {
      const hasDecimals = samples.some((value) => String(value).includes('.'));
      return hasDecimals ? 'DECIMAL(10,2)' : 'INT';
    }

    const allDates = samples.every((value) => {
      const date = new Date(value);
      return date instanceof Date && !isNaN(date.getTime());
    });
    if (allDates) return 'DATE';

    const hasLongText = samples.some((value) => String(value).length > 255);
    return hasLongText ? 'TEXT' : 'VARCHAR(255)';
  }

  useEffect(() => {
    generateSQL();
  }, [tableName, columnConfig, queryType, whereColumn]);

  useEffect(() => {
    if (generatedQuery) {
      hljs.highlightAll();
    }
  }, [generatedQuery]);

  const handleTableNameChange = (name: string) => {
    setTableName(name);
    setTableNameError(!name.trim());
  };

  const handleColumnConfigChange = (
    index: number,
    field: keyof ColumnConfig | 'remove',
    value: any
  ) => {
    if (field === 'remove') {
      setColumnConfig(value);
      return;
    }

    if (index === columnConfig.length) {
      setColumnConfig([
        ...columnConfig,
        {
          name: value,
          include: true,
          type: 'VARCHAR(255)',
          addColumn: false,
        },
      ]);
      return;
    }

    const newConfig = [...columnConfig];
    newConfig[index] = { ...newConfig[index], [field]: value };
    setColumnConfig(newConfig);
  };

  const generateAlterTableQueries = (columns: ColumnConfig[]) => {
    const columnsToAdd = columns.filter((col) => col.include && col.addColumn);
    if (columnsToAdd.length === 0) return '';

    const alterQueries = columnsToAdd.map((col) => {
      const columnName = col.alias || col.name;
      return `ALTER TABLE \`${tableName}\`
ADD COLUMN IF NOT EXISTS \`${columnName}\` ${col.type};`;
    });
    return alterQueries.join('\n');
  };

  const generateSQL = () => {
    if (!tableName.trim()) {
      setGeneratedQuery('-- Please enter a table name');
      return;
    }

    const includeColumns = columnConfig.filter((col) => col.include);

    if (includeColumns.length === 0) {
      setGeneratedQuery('-- Please select at least one column');
      return;
    }

    let finalQuery = '';

    if (queryType !== 'CREATE') {
      const alterQueries = generateAlterTableQueries(includeColumns);
      if (alterQueries) {
        finalQuery = alterQueries + '\n\n';
      }
    }

    switch (queryType) {
      case 'CREATE':
        finalQuery = generateCreateTableQuery(includeColumns);
        break;
      case 'INSERT':
        finalQuery += generateInsertQuery(includeColumns);
        break;
      case 'UPDATE':
        finalQuery += generateUpdateQuery(includeColumns);
        break;
    }

    setGeneratedQuery(finalQuery);
  };

  const generateCreateTableQuery = (columns: ColumnConfig[]) => {
    let query = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n`;
    query += '  `id` INT AUTO_INCREMENT PRIMARY KEY,\n';

    columns.forEach((col, index) => {
      const columnName = col.alias || col.name;
      query += `  \`${columnName}\` ${col.type}`;
      if (index < columns.length - 1) {
        query += ',';
      }
      query += '\n';
    });

    query += ');';
    return query;
  };

  const generateInsertQuery = (columns: ColumnConfig[]) => {
    if (excelData.length === 0) {
      return '-- No data to insert';
    }

    const columnNames = columns
      .map((col) => `\`${col.alias || col.name}\``)
      .join(', ');
    let query = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES\n`;

    const values = excelData
      .map((row, rowIndex) => {
        const rowValues = columns
          .map((col) => {
            const value = row[col.name];

            if (value === null || value === undefined || value === '') {
              return 'NULL';
            } else if (col.type === 'DATE') {
              const formattedDate = formatDateForMySQL(String(value));
              return formattedDate ? `'${formattedDate}'` : 'NULL';
            } else if (col.type === 'VARCHAR(255)' || col.type === 'TEXT') {
              return `'${String(value).replace(/'/g, "''")}'`;
            } else {
              return value;
            }
          })
          .join(', ');

        return `(${rowValues})${rowIndex < excelData.length - 1 ? ',' : ';'}`;
      })
      .join('\n');

    return query + values;
  };

  const generateUpdateQuery = (columns: ColumnConfig[]) => {
    if (excelData.length === 0) {
      return '-- No data to update';
    }

    const queries = excelData.map((row) => {
      const updates = columns
        .filter((col) => col.name !== whereColumn)
        .map((col) => {
          const value = row[col.name];
          let formattedValue;

          if (value === null || value === undefined || value === '') {
            formattedValue = 'NULL';
          } else if (col.type === 'DATE') {
            const formattedDate = formatDateForMySQL(String(value));
            formattedValue = formattedDate ? `'${formattedDate}'` : 'NULL';
          } else if (col.type === 'VARCHAR(255)' || col.type === 'TEXT') {
            formattedValue = `'${String(value).replace(/'/g, "''")}'`;
          } else {
            formattedValue = value;
          }

          const columnName = col.alias || col.name;
          return `\`${columnName}\` = ${formattedValue}`;
        })
        .join(',\n  ');

      const whereValue = row[whereColumn];
      const formattedWhereValue =
        typeof whereValue === 'string'
          ? `'${whereValue.replace(/'/g, "''")}'`
          : whereValue;

      const whereColumnAlias =
        columnConfig.find((col) => col.name === whereColumn)?.alias ||
        whereColumn;
      return `UPDATE \`${tableName}\`\nSET\n  ${updates}\nWHERE \`${whereColumnAlias}\` = ${formattedWhereValue};`;
    });

    return queries.join('\n\n');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedQuery).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <div className="my-container">
        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 container1">
          <div className="flex items-center mb-4">
            <Database className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white overflow-hidden whitespace-nowrap">
              Dataset Preview
            </h2>
          </div>
          <DataPreview data={excelData} headers={headers} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 container2">
          <QueryOptions
            tableName={tableName}
            setTableName={handleTableNameChange}
            tableNameError={tableNameError}
            columnConfig={columnConfig}
            onColumnConfigChange={handleColumnConfigChange}
            queryType={queryType}
            setQueryType={setQueryType}
            whereColumn={whereColumn}
            setWhereColumn={setWhereColumn}
            headers={headers}
          />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white flex gap-2 items-center">
            <Sparkles className="h-6 w-6 text-blue-500" />
            SQL Generated
          </h3>
          <button
            className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
              copied
                ? 'bg-green-50 dark:bg-gray-800 text-green-600 border border-green-200'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 hover:bg-gray-100 border border-gray-200 dark:border-gray-700'
            }`}
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" /> Copy SQL
              </>
            )}
          </button>
        </div>
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 custom-scrollbar">
          <pre className="p-4 text-sm">
            <code className="language-sql dark:bg-gray-900 dark:text-gray-400">
              {generatedQuery}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default QueryGenerator;
