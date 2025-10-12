import React from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';

type ColumnType =
  | 'VARCHAR(255)'
  | 'INT'
  | 'FLOAT'
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

interface QueryOptionsProps {
  tableName: string;
  setTableName: (name: string) => void;
  tableNameError: boolean;
  columnConfig: ColumnConfig[];
  onColumnConfigChange: (
    index: number,
    field: keyof ColumnConfig | 'remove',
    value: any
  ) => void;
  queryType: 'INSERT' | 'CREATE' | 'UPDATE';
  setQueryType: (type: 'INSERT' | 'CREATE' | 'UPDATE') => void;
  whereColumn: string;
  setWhereColumn: (column: string) => void;
  headers: string[];
}

const QueryOptions: React.FC<QueryOptionsProps> = ({
  tableName,
  setTableName,
  tableNameError,
  columnConfig,
  onColumnConfigChange,
  queryType,
  setQueryType,
  whereColumn,
  setWhereColumn,
  headers,
}) => {
  const addNewColumn = () => {
    const newColumnName = `column_${columnConfig.length + 1}`;
    onColumnConfigChange(columnConfig.length, 'name', newColumnName);
  };

  const removeColumn = (index: number) => {
    if (queryType === 'UPDATE' && columnConfig[index].name === whereColumn) {
      return; // Don't allow removing the WHERE column
    }
    const newConfig = [...columnConfig];
    newConfig.splice(index, 1);
    onColumnConfigChange(-1, 'remove', newConfig);
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <Settings className="h-5 w-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-medium text-gray-800 dark:text-white overflow-hidden w-[100%] whitespace-nowrap">
          Query Options
        </h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label
              htmlFor="tableName"
              className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1 px-4 overflow-hidden w-[100%] whitespace-nowrap"
            >
              Table Name <span className="text-red-500 ">*</span>
            </label>
            <input
              type="text"
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className={`w-full px-3 py-2 border dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 dark:text-gray-300 dark:focus:bg-gray-800 focus:border-blue-500 ${
                tableNameError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter table name"
              required
            />
            {tableNameError && (
              <p className="mt-1 text-sm text-red-500">
                Table name is required
              </p>
            )}
          </div>

          <div>
            <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1 px-4 overflow-hidden w-[100%] whitespace-nowrap">
              Query Type
            </label>
            <div className="flex space-x-4 h-10 border-[1px] p-4 dark:border-gray-700 dark:bg-gray-900 rounded-md overflow-hidden w-[100%] whitespace-nowrap">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className={`h-4 w-4 rounded-full border-gray-400 dark:border-gray-600 appearance-none bg-white dark:bg-gray-700 checked:bg-blue-600 dark:checked:bg-blue-900 focus:ring-0`}
                  value="CREATE"
                  checked={queryType === 'CREATE'}
                  onChange={() => setQueryType('CREATE')}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-400">
                  CREATE
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className={`h-4 w-4 rounded-full border-gray-400 dark:border-gray-600 appearance-none bg-white dark:bg-gray-700 checked:bg-blue-600 dark:checked:bg-blue-900 focus:ring-0`}
                  value="INSERT"
                  checked={queryType === 'INSERT'}
                  onChange={() => setQueryType('INSERT')}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-400">
                  INSERT
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="UPDATE"
                  checked={queryType === 'UPDATE'}
                  onChange={() => setQueryType('UPDATE')}
                  className={`h-4 w-4 rounded-full border-gray-400 dark:border-gray-600 appearance-none bg-white dark:bg-gray-700 checked:bg-blue-600 dark:checked:bg-blue-900 focus:ring-0`}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-400">
                  UPDATE
                </span>
              </label>
            </div>
          </div>
        </div>

        {queryType === 'UPDATE' && (
          <div className="relative w-full">
            <label
              htmlFor="whereColumn"
              className="block text-md px-4 font-medium text-gray-700 dark:text-gray-300 mb-1 overflow-hidden w-full whitespace-nowrap"
            >
              Update WHERE Column
            </label>
            <select
              id="whereColumn"
              value={whereColumn}
              onChange={(e) => setWhereColumn(e.target.value)}
              className="w-full appearance-none px-3 pr-10 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 dark:text-gray-400"
            >
              {headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
            {/* Icono personalizado */}
            <div className="pointer-events-none absolute inset-y-0 right-3 top-7 flex items-center text-gray-400">
              ▼
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-end mb-2 overflow-hidden w-[100%] whitespace-nowrap">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 px-4 overflow-hidden w-[100%] whitespace-nowrap">
              Column Configuration
            </h4>
            <button
              onClick={addNewColumn}
              className="inline-flex items-center px-3 py-1 border border-gray-700 text-gray-600 rounded-md hover:bg-gray-700 transition-colors "
            >
              <Plus className="h-4 w-4 mr-1 " />
              Add Column
            </button>
          </div>
          <div className="border border-gray-200 rounded-md overflow-hidden dark:border-gray-600 dark:text-white">
            <div className="grid grid-cols-12 bg-gray-50 py-2 px-4 border-b border-gray-200 dark:bg-gray-900 dark:border-gray-600">
              <div className="col-span-1 overflow-hidden w-[80%]">INCLUDE</div>
              <div className="col-span-3 overflow-hidden w-[80%] whitespace-nowrap">
                ORIGINAL NAME
              </div>
              <div className="col-span-3 overflow-hidden w-[80%] whitespace-nowrap">
                NEW NAME
              </div>
              <div className="col-span-3 overflow-hidden w-[80%] whitespace-nowrap">
                DATA TYPE
              </div>
              {queryType !== 'CREATE' && (
                <div className="col-span-1 overflow-hidden w-[95%]">ADD</div>
              )}
              <div className="col-span-1 overflow-hidden w-[95%]">DELETE</div>
            </div>

            <div className="divide-y david-gra-200 dark:divide-gray-800 dark:bg-gray-900 ">
              {columnConfig.map((column, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 px-4 py-2 items-center hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={column.include}
                      onChange={(e) =>
                        onColumnConfigChange(index, 'include', e.target.checked)
                      }
                      className={`h-4 w-4 rounded border-gray-300 dark:border-gray-700
    dark:bg-gray-600 dark:border-gray-500 text-blue-900 appearance-none checked:bg-gray-400 checked:border-transparent dark:checked:bg-blue-900
  `}
                      disabled={
                        queryType === 'UPDATE' && column.name === whereColumn
                      }
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) =>
                        onColumnConfigChange(index, 'name', e.target.value)
                      }
                      className="w-[80%] px-2 py-1 text-sm border dark:border-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:bg-transparent"
                      disabled={
                        queryType === 'UPDATE' && column.name === whereColumn
                      }
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={column.alias || ''}
                      onChange={(e) =>
                        onColumnConfigChange(index, 'alias', e.target.value)
                      }
                      className="w-[80%] px-2 py-1 text-sm border dark:border-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:bg-transparent"
                      placeholder="New name"
                      disabled={
                        !column.include ||
                        (queryType === 'UPDATE' && column.name === whereColumn)
                      }
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={column.type}
                      onChange={(e) =>
                        onColumnConfigChange(
                          index,
                          'type',
                          e.target.value as ColumnType
                        )
                      }
                      className="w-[70%] py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-transparent dark:bg-transparent"
                      disabled={
                        !column.include ||
                        (queryType === 'UPDATE' && column.name === whereColumn)
                      }
                    >
                      <option value="VARCHAR(255)">VARCHAR(255)</option>
                      <option value="INT">INT</option>
                      <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                      <option value="DATE">DATE</option>
                      <option value="TEXT">TEXT</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                    </select>
                  </div>
                  {queryType !== 'CREATE' && (
                    <div className="col-span-1 items-center flex justify-center w-7">
                      <input
                        type="checkbox"
                        checked={column.addColumn}
                        onChange={(e) =>
                          onColumnConfigChange(
                            index,
                            'addColumn',
                            e.target.checked
                          )
                        }
                        className={`h-4 w-4 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 text-blue-900 appearance-none checked:bg-blue-900 checked:border-transparent dark:checked:bg-blue-900`}
                        disabled={
                          !column.include ||
                          (queryType === 'UPDATE' &&
                            column.name === whereColumn)
                        }
                      />
                    </div>
                  )}
                  <div className="col-span-1 items-center flex justify-center w-11">
                    <button
                      onClick={() => removeColumn(index)}
                      className={`p-1 rounded-md ${
                        queryType === 'UPDATE' && column.name === whereColumn
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-red-500 hover:bg-red-50'
                      }`}
                      disabled={
                        queryType === 'UPDATE' && column.name === whereColumn
                      }
                      title={
                        queryType === 'UPDATE' && column.name === whereColumn
                          ? "Can't remove WHERE column"
                          : 'Remove column'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryOptions;
