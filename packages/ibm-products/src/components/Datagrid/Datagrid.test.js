/**
 * Copyright IBM Corp. 2022, 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, forwardRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react'; // https://testing-library.com/docs/react-testing-library/intro
import uuidv4 from '../../global/js/utils/uuidv4';
import { useDatagrid } from '.';
import { makeData } from './utils/makeData';

import {
  checkLogging,
  expectError,
  expectWarn,
  mockHTMLElement,
} from '../../global/js/utils/test-helper';
import { Datagrid } from '.';
import { pkg } from '../../settings';

import {
  useInfiniteScroll,
  useSelectRows,
  useDisableSelectRows,
  useExpandedRow,
  useNestedRows,
  useSortableColumns,
  useOnRowClick,
  useCustomizeColumns,
  useSelectAllWithToggle,
  useRowIsMouseOver,
  useStickyColumn,
  useActionsColumn,
  useColumnOrder,
  useColumnRightAlign,
} from '.';

import {
  TableToolbarContent,
  TableToolbarSearch,
  Button,
  Pagination,
  TableBatchActions,
  TableBatchAction,
} from '@carbon/react';
import { Download, Restart, Filter, Activity, Add } from '@carbon/react/icons';
import { carbon } from '../../settings';

// import { DatagridActions, DatagridBatchActions, DatagridPagination, } from './Datagrid.stories';

import namor from 'namor';

import userEvent from '@testing-library/user-event';
const { click, hover, unhover } = userEvent.setup({
  // delay: null, // prev version
  advanceTimers: jest.advanceTimersByTime,
});

const dataTestId = uuidv4();

const componentName = Datagrid.displayName;

const defaultHeader = [
  {
    Header: 'Row Index',
    accessor: (row, i) => i,
    sticky: 'left',
    id: 'rowIndex', // id is required when accessor is a function.
  },
  {
    Header: 'First Name',
    accessor: 'firstName',
    sticky: 'left',
  },
  {
    Header: 'Last Name',
    accessor: 'lastName',
  },
  {
    Header: 'Age',
    accessor: 'age',
    width: 50,
  },
  {
    Header: 'Visits',
    accessor: 'visits',
    width: 60,
  },
  {
    Header: 'Someone 1',
    accessor: 'someone1',
  },
  {
    Header: 'Someone 2',
    accessor: 'someone2',
  },
  {
    Header: 'Someone 3',
    accessor: 'someone3',
  },
  {
    Header: 'Someone 4',
    accessor: 'someone4',
  },
  {
    Header: 'Someone 5',
    accessor: 'someone5',
  },
  {
    Header: 'Someone 6',
    accessor: 'someone6',
  },
  {
    Header: 'Someone 7',
    accessor: 'someone7',
  },
  {
    Header: 'Someone 8',
    accessor: 'someone8',
  },
  {
    Header: 'Someone 9',
    accessor: 'someone9',
  },
  {
    Header: 'Someone 10',
    accessor: 'someone10',
  },
];

const DatagridBatchActions = (datagridState) => {
  const { selectedFlatRows, toggleAllRowsSelected } = datagridState;
  const totalSelected = selectedFlatRows && selectedFlatRows.length;
  const onBatchAction = () => alert('Batch action');
  const actionName = 'Action';
  return (
    <TableBatchActions
      shouldShowBatchActions={totalSelected > 0}
      totalSelected={totalSelected}
      onCancel={() => toggleAllRowsSelected(false)}
    >
      <TableBatchAction
        renderIcon={(props) => <Activity size={16} {...props} />}
        onClick={onBatchAction}
      >
        {actionName}
      </TableBatchAction>
    </TableBatchActions>
  );
};

const BasicUsage = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid({
    columns,
    data,
  });

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const DatagridActions = (datagridState) => {
  const {
    selectedFlatRows,
    setGlobalFilter,
    CustomizeColumnsButton,
    RowSizeDropdown,
    rowSizeDropdownProps,
  } = datagridState;
  const downloadCsv = () => {
    alert('Downloading...');
  };

  const refreshColumns = () => {
    alert('refreshing...');
  };
  const leftPanelClick = () => {
    alert('open/close left panel...');
  };
  const searchForAColumn = 'Search';
  const isNothingSelected = selectedFlatRows.length === 0;
  const style = {
    'button:nth-child(1) > span:nth-child(1)': {
      bottom: '-37px',
    },
  };
  return (
    isNothingSelected && (
      <React.Fragment>
        <Button
          kind="ghost"
          hasIconOnly
          tooltipPosition="bottom"
          renderIcon={(props) => <Filter size={16} {...props} />}
          iconDescription={'Left panel'}
          onClick={leftPanelClick}
        />
        <TableToolbarContent>
          <TableToolbarSearch
            size="lg"
            id="columnSearch"
            persistent
            placeholder={searchForAColumn}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <RowSizeDropdown {...rowSizeDropdownProps} />
          <div style={style}>
            <Button
              kind="ghost"
              hasIconOnly
              tooltipPosition="bottom"
              renderIcon={(props) => <Restart size={16} {...props} />}
              iconDescription={'Refresh'}
              onClick={refreshColumns}
            />
          </div>
          <div style={style}>
            <Button
              kind="ghost"
              hasIconOnly
              tooltipPosition="bottom"
              renderIcon={(props) => <Download size={16} {...props} />}
              iconDescription={'Download CSV'}
              onClick={downloadCsv}
            />
          </div>
          {CustomizeColumnsButton && (
            <div style={style}>
              <CustomizeColumnsButton />
            </div>
          )}
        </TableToolbarContent>
      </React.Fragment>
    )
  );
};

// eslint-disable-next-line react/prop-types
const DatagridPagination = ({ state, setPageSize, gotoPage, rows }) => {
  const updatePagination = ({ page, pageSize }) => {
    setPageSize(pageSize);
    gotoPage(page - 1); // Carbon is non-zero-based
  };

  return (
    <Pagination
      // eslint-disable-next-line react/prop-types
      page={state.pageIndex + 1} // react-table is zero-based
      // eslint-disable-next-line react/prop-types
      pageSize={state.pageSize}
      // eslint-disable-next-line react/prop-types
      pageSizes={state.pageSizes || [10, 20, 30, 40, 50]}
      // eslint-disable-next-line react/prop-types
      totalItems={rows.length}
      onChange={updatePagination}
    />
  );
};

const EmptyUsage = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(0));
  const emptyStateTitle = 'Empty State Title';
  const emptyStateDescription =
    'Description test explaining why this card is empty.';
  const emptyStateSize = 'lg';
  const illustrationTheme = 'light';

  const dataGridState = useDatagrid({
    columns,
    data,
    emptyStateTitle,
    emptyStateDescription,
    emptyStateSize,
    illustrationTheme,
    DatagridActions,
    DatagridBatchActions,
    DatagridPagination,
  });

  return <Datagrid datagridState={{ ...dataGridState }} {...rest}></Datagrid>;
};

const TenThousandEntriesWithoutFeatureFlag = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10000));
  pkg.feature['Datagrid.useInfiniteScroll'] = false;
  const datagridState = useDatagrid(
    {
      columns,
      data,
    },
    useInfiniteScroll
  );

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const TenThousandEntries = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10000));
  pkg.feature['Datagrid.useInfiniteScroll'] = true;
  const datagridState = useDatagrid(
    {
      columns,
      data,
    },
    useInfiniteScroll
  );

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const IsHoverOnRow = () => {
  const Cell = ({ row }) => {
    if (row.isMouseOver) {
      return 'yes hovering!';
    }
    return '';
  };
  const columns = React.useMemo(
    () => [
      ...defaultHeader.slice(0, 3),
      {
        Header: 'Is hover on row?',
        id: 'isHoveringColumn',
        disableSortBy: true,
        Cell,
      },
    ],
    []
  );
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
    },
    useRowIsMouseOver
  );

  return <Datagrid datagridState={{ ...datagridState }} />;
};

const DisableSelectRow = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
      DatagridActions,
      DatagridBatchActions,
      endPlugins: [useDisableSelectRows],
      shouldDisableSelectRow: (row) => row.id % 2 === 0,
      disableSelectAll: true,
    },
    useSelectRows
  );

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const ExpandedRow = ({ ...rest } = {}) => {
  const expansionRenderer = ({ row }) => <div>Content for {row.id}</div>;

  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
      ExpandedRowContentComponent: expansionRenderer,
      expandedContentHeight: 95,
    },
    useExpandedRow
  );

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const SelectItemsInAllPages = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(100));
  const [areAllSelected, setAreAllSelected] = useState(false);
  const datagridState = useDatagrid(
    {
      columns,
      data,
      initialState: {
        pageSize: 10,
        pageSizes: [5, 10, 25, 50],
      },
      selectAllToggle: {
        labels: {
          allRows: 'Select all',
        },
        onSelectAllRows: setAreAllSelected,
      },
      DatagridPagination,
      DatagridActions,
      DatagridBatchActions,
    },
    useSelectRows,
    useSelectAllWithToggle
  );

  return (
    <>
      <Datagrid datagridState={{ ...datagridState }} {...rest} />
      <h3>Doc in Notes...</h3>
      <p>{`Are all selected across all pages? - ${areAllSelected}`}</p>
    </>
  );
};

const HideSelectAll = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
      hideSelectAll: true,
    },
    useSelectRows
  );

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const range = (len) => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

// eslint-disable-next-line react/prop-types
const Wrapper = ({ children }) => (
  <div
    style={{
      height: '100vh',
      width: '100%',
      padding: '1rem',
      margin: '0',
      zIndex: '0',
    }}
  >
    {children}
  </div>
);

const RowSizeDropdown = ({ ...rest } = {}) => {
  const columns = React.useMemo(
    () => [
      ...defaultHeader.slice(0, 3),
      {
        Header: 'Different cell content',
        id: 'rowSizeDemo-cell',
        disableSortBy: true,
        Cell: ({ rowSize }) => rowSize,
      },
    ],
    []
  );
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
      rowSize: 'xs',
      rowSizes: [
        {
          value: 'xl',
          labelText: 'More than super',
        },
        {
          value: 'lg',
          labelText: 'Super tall row',
        },
        {
          value: 'md',
        },
        {
          value: 'xs',
          labelText: 'Teeny tiny row',
        },
      ],
      /*onRowSizeChange: (value) => {
      },*/
      DatagridActions,
      DatagridBatchActions,
    },
    useSelectRows
  );

  return (
    <Wrapper>
      <Datagrid datagridState={{ ...datagridState }} {...rest} />
    </Wrapper>
  );
};

const CustomizingColumns = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
      initialState: {
        hiddenColumns: ['age'],
        columnOrder: [],
      },
      /*customizeColumnsProps: {
        onSaveColumnPrefs: (newColDefs) => {
        },
      },*/
      DatagridActions,
      DatagridBatchActions,
    },
    useCustomizeColumns,
    useColumnOrder
  );

  return (
    <>
      <Datagrid datagridState={{ ...datagridState }} {...rest} />
      <div>
        Hidden column ids:
        <pre>{JSON.stringify(datagridState.state.hiddenColumns, null, 2)}</pre>
      </div>
      <p>
        More details in the <strong>Notes</strong> section
      </p>
    </>
  );
};

const NestedRows = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10, 5, 2, 2));
  const datagridState = useDatagrid(
    {
      columns,
      data,
    },
    useNestedRows
  );

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const NestedTable = ({ ...rest } = {}) => {
  const [data] = useState(makeData(20));
  const nestedColumns = React.useMemo(() => [...defaultHeader], []);
  nestedColumns[0] = {
    Header: 'Row #',
    accessor: (row, i) => i,
    sticky: 'left',
  };
  const nestedDatagridState = useDatagrid({
    columns: nestedColumns,
    data,
    initialState: { pageSize: 10 },
    DatagridPagination,
  });

  const expansionRenderer = () => (
    <div className="carbon-nested-table">
      <Datagrid datagridState={{ ...nestedDatagridState }} />
    </div>
  );

  const columns = React.useMemo(() => defaultHeader, []);
  const datagridState = useDatagrid(
    {
      columns,
      data,
      ExpandedRowContentComponent: expansionRenderer,
      expandedContentHeight: (nestedDatagridState.state.pageSize + 2) * 48 + 1, // +2 for header and pagination
    },
    useExpandedRow
  );

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const RadioSelect = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
      hideSelectAll: true,
      radio: true,
      initialState: {
        selectedRowIds: {
          3: true,
        },
      },
    },
    useSelectRows
  );

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const SelectableRow = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
    },
    useSelectRows
  );

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const SortableColumns = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
    },
    useSortableColumns
  );

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const newPersonWithTwoLines = () => {
  return {
    firstName: (
      <>
        <div>{namor.generate({ words: 1, numbers: 0 })}</div>
        <div>{namor.generate({ words: 1, numbers: 0 })}</div>
      </>
    ),
    lastName: namor.generate({ words: 1, numbers: 0 }),
    age: Math.floor(Math.random() * 30),
  };
};

const makeDataWithTwoLines = (length) =>
  range(length).map(() => newPersonWithTwoLines());

const TopAlignment = forwardRef(({ ...rest }, ref) => {
  const columns = React.useMemo(() => defaultHeader.slice(0, 3), []);
  const [data] = useState(makeDataWithTwoLines(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
      verticalAlign: 'top',
      variableRowHeight: true,
      rowSize: 'xs',
      rowSizes: [
        {
          value: 'xl',
        },
        {
          value: 'lg',
        },
        {
          value: 'md',
        },
        {
          value: 'xs',
        },
      ],
      DatagridActions,
      DatagridBatchActions,
    },
    useSelectRows
  );

  return <Datagrid ref={ref} datagridState={{ ...datagridState }} {...rest} />;
});

const ClickableRow = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
      onRowClick: (row) => alert(`Clicked ${row.id}`),
    },
    useOnRowClick
  );

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const InfiniteScroll = () => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data, setData] = useState(makeData(0));

  const [isFetching, setIsFetching] = useState(false);
  const fetchData = () =>
    new Promise((resolve) => {
      setIsFetching(true);
      setTimeout(() => {
        setData(data.concat(makeData(30, 5, 2)));
        setIsFetching(false);
        resolve();
      }, 1000);
    });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const datagridState = useDatagrid(
    {
      columns,
      data,
      isFetching,
      fetchMoreData: fetchData,
    },
    useInfiniteScroll
  );

  return (
    <Wrapper>
      <Datagrid datagridState={{ ...datagridState }} />;
    </Wrapper>
  );
};

const InitialLoad = () => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data, setData] = useState(makeData(0));

  const [isFetching, setIsFetching] = useState(false);
  const fetchData = () =>
    new Promise((resolve) => {
      setIsFetching(true);
      setTimeout(() => {
        setData(data.concat(makeData(30, 5, 2)));
        resolve();
      }, 1000);
    }).then(() => setIsFetching(false));

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const datagridState = useDatagrid({
    columns,
    data,
    isFetching,
  });

  return <Datagrid datagridState={{ ...datagridState }} />;
};

const WithPagination = ({ ...rest } = {}) => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(100));
  const datagridState = useDatagrid({
    columns,
    data,
    initialState: {
      pageSize: 25,
      pageSizes: [5, 10, 25, 50],
    },
    DatagridPagination,
  });

  return <Datagrid datagridState={{ ...datagridState }} {...rest} />;
};

const BatchActions = () => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(10));
  const datagridState = useDatagrid(
    {
      columns,
      data,
      DatagridActions,
      DatagridBatchActions,
    },
    useSelectRows
  );

  return <Datagrid datagridState={{ ...datagridState }} />;
};

const StickyActionsColumn = ({ ...rest } = {}) => {
  const columns = React.useMemo(
    () => [
      ...defaultHeader,
      {
        Header: '',
        accessor: 'actions',
        sticky: 'right',
        width: 60,
        isAction: true,
      },
    ],
    []
  );
  const [data] = useState(makeData(10));
  const [msg, setMsg] = useState('click action menu');
  const onActionClick = (actionId, row) => {
    const { original } = row;
    setMsg(
      `Clicked [${actionId}] on row: <${original.firstName} ${original.lastName}>`
    );
  };

  const datagridState = useDatagrid(
    {
      columns,
      data,
      rowActions: [
        {
          id: 'edit',
          itemText: 'Edit',
          onClick: onActionClick,
        },
        {
          id: 'vote',
          itemText: 'Vote',
          onClick: onActionClick,
        },
        {
          id: 'retire',
          itemText: 'Retire',
          onClick: onActionClick,
        },
        {
          id: 'delete',
          itemText: 'Delete',
          hasDivider: true,
          isDelete: true,
          onClick: onActionClick,
        },
      ],
    },
    useStickyColumn,
    useActionsColumn
  );
  return (
    <Wrapper>
      <h3>{msg}</h3>
      <Datagrid datagridState={{ ...datagridState }} {...rest} />
      <p>More details documentation check the Notes section below</p>
    </Wrapper>
  );
};

beforeAll(() => {
  jest.spyOn(global.console, 'warn').mockImplementation((message) => {
    if (!message.includes('componentWillReceiveProps')) {
      global.console.warn(message);
    }
  });
});

describe(componentName, () => {
  beforeEach(() => {
    jest.spyOn(global.console, 'error').mockImplementation(() => {});
    //This will suppress the warning about Arrows16 Component (will be removed in the next major version of @carbon/icons-react).
    jest.spyOn(global.console, 'warn').mockImplementation(() => {});
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
    window.ResizeObserver = ResizeObserver;
  });

  it('renders a basic data grid component with devTools attribute', async () => {
    render(<BasicUsage data-testid={dataTestId} />);

    expect(screen.getByTestId(dataTestId)).toHaveDevtoolsAttribute(
      Datagrid.displayName
    );

    expect(screen.getByRole('table')).toHaveClass(
      `${carbon.prefix}--data-table`
    );

    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('thead')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('th').length
    ).toEqual(16);
    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr').length
    ).toEqual(10);
  });

  it('renders a Batch Actions Table', async () => {
    render(<BatchActions data-testid={dataTestId}></BatchActions>);

    const alertMock = jest.spyOn(window, 'alert');

    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('thead')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('th')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('input')[0]
    );
    const tableBodyRows = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr');
    const numRows = tableBodyRows.length;

    for (var i = 0; i < numRows; i++) {
      expect(tableBodyRows[i].classList[1]).toEqual(
        `${carbon.prefix}--data-table--selected`
      );
    }

    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('thead')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('th')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('input')[0]
    );

    expect(
      document.getElementsByClassName(`${carbon.prefix}--search-input`)[0]
    ).toBeDefined();

    const filterButton = screen.getByLabelText('Left panel');
    fireEvent.click(filterButton);
    expect(alertMock).toHaveBeenCalledTimes(1);

    const rowHeightButton = screen.getByRole('button', { name: /Row height/i });
    fireEvent.click(rowHeightButton);

    const rowSizeDropDown = [
      'Extra large',
      'Large (default)',
      'Medium',
      'Small',
      'Extra small',
    ];
    const rowSize = document
      .getElementsByClassName('c4p--datagrid__row-size-dropdown')[0]
      .getElementsByTagName('div')[0]
      .getElementsByTagName('fieldset')[0]
      .getElementsByTagName('div').length;

    for (var k = 0; k < rowSize; k++) {
      expect(
        document
          .getElementsByClassName('c4p--datagrid__row-size-dropdown')[0]
          .getElementsByTagName('div')[0]
          .getElementsByTagName('fieldset')[0]
          .getElementsByTagName('div')
          .item(k)
          .getElementsByTagName('label')[0]
          .getElementsByTagName('span')[1].textContent
      ).toEqual(rowSizeDropDown[k]);
    }

    const refreshButton = screen.getByLabelText('Refresh');
    fireEvent.click(refreshButton);
    expect(alertMock).toHaveBeenCalledTimes(2);

    const downloadButton = screen.getByLabelText('Download CSV');
    fireEvent.click(downloadButton);
    expect(alertMock).toHaveBeenCalledTimes(3);

    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('thead')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('th')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('input')[0]
    );

    expect(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('p')[0]
        .getElementsByTagName('span')[0].textContent
    ).toEqual('10 items selected');

    expect(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[0].textContent
    ).toEqual('Action');
    fireEvent.click(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[0]
    );

    expect(alertMock).toHaveBeenCalledTimes(4);

    expect(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[1].textContent
    ).toEqual('Cancel');
    fireEvent.click(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[1]
    );
  });

  it('renders nothing and logs a warning to console if no datagridState is supplied', async () => {
    expectWarn(
      'Datagrid was not passed datagridState which is required to render this component.',
      () => {
        const errorMock = jest
          .spyOn(console, 'error')
          .mockImplementation(() => {});
        const { container } = render(
          <BasicUsage data-testid={dataTestId} datagridState={null} />
        );
        checkLogging(
          errorMock,
          /^Warning: Failed prop type: The prop `datagridState` is marked as required in `Datagrid`, but its value is `null`./
        );
        expect(container.children.length).toEqual(0);
        jest.spyOn(console, 'error').mockRestore();
      }
    );
  });

  //Empty State
  it('renders an empty table', async () => {
    render(<EmptyUsage data-testid={dataTestId}></EmptyUsage>);
    expect(
      screen.getByRole('table').getElementsByTagName('tbody')[0].className
    ).toEqual('c4p--datagrid__empty-state-body');

    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr').length
    ).toEqual(1);

    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('td')[0].textContent
    ).toBeNull;

    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('td')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('svg')[0]
    ).toBeDefined();

    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('td')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('h3')[0].textContent
    ).toEqual('Empty State Title');

    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('td')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('p')[0].textContent
    ).toEqual('Description test explaining why this card is empty.');
  });

  it('Initial Load', async () => {
    render(<InitialLoad data-testid={dataTestId}></InitialLoad>);
    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('thead')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('th').length
    ).toEqual(16);
  });

  it('Infinite Scroll', async () => {
    render(<InfiniteScroll data-testid={dataTestId}></InfiniteScroll>);

    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('div')[0].classList[0]
    ).toBe('c4p--datagrid__virtual-scrollbar');
  });

  //Ten Thousand Entries
  it('render logs an error if infinite scroll not enabled', async () => {
    expectError(
      'Carbon for IBM Products (Error): Feature "Datagrid.useInfiniteScroll" not enabled. To enable see the notes on feature flags in the README.',
      () => {
        render(
          <TenThousandEntriesWithoutFeatureFlag data-testid={dataTestId} />
        );
      },
      true
    );
  });

  it('renders Ten Thousand table entries', async () => {
    render(<TenThousandEntries data-testid={dataTestId}></TenThousandEntries>);

    expect(
      parseInt(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('div')[0]
          .getElementsByTagName('div')[0].style.height,
        10
      )
    ).toEqual(480000);

    expect(
      parseInt(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('div')[0]
          .getElementsByTagName('div')[0].style.height,
        10
      ) /
        parseInt(
          screen
            .getByRole('table')
            .getElementsByTagName('tbody')[0]
            .getElementsByTagName('div')[0]
            .getElementsByTagName('div')[0]
            .getElementsByTagName('div')[0].style.height
        )
    ).toEqual(10000);
  });

  it('With Pagination', async () => {
    render(<WithPagination data-testid={dataTestId}></WithPagination>);

    expect(
      document.getElementById(`${carbon.prefix}-pagination-select-4`)
    ).toBeDefined();
    expect(
      document.getElementById(`${carbon.prefix}-pagination-select-6`)
    ).toBeDefined();
  });

  it('Clickable Row', async () => {
    const alertMock = jest.spyOn(window, 'alert');
    render(<ClickableRow data-testid={dataTestId}></ClickableRow>);

    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')[0]
    );

    setTimeout(() => {
      expect(alertMock).toHaveBeenCalledTimes(2);
    }, 1000);
  });

  function completeHoverOperation(rowNumber) {
    hover(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')
        .item(rowNumber)
        .getElementsByTagName('td')[3]
    );

    setTimeout(() => {
      expect(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')
          .item(rowNumber)
          .getElementsByTagName('td')[3].textContent
      ).toBe('yes hovering!');
    }, 300);

    unhover(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')[rowNumber]
    );
    setTimeout(() => {
      expect(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')
          .item(rowNumber)
          .getElementsByTagName('td')[3].textContent
      ).toBe('');
    }, 300);
  }

  it('Is Hover On Row', async () => {
    render(<IsHoverOnRow data-testid={dataTestId}></IsHoverOnRow>);
    completeHoverOperation(1);

    completeHoverOperation(5);
  });

  //Disables Selected Rows
  it('Renders Disable Select Row', async () => {
    render(<DisableSelectRow data-testid={dataTestId}></DisableSelectRow>);

    const alertMock = jest.spyOn(window, 'alert');

    expect(
      document.getElementsByClassName(`${carbon.prefix}--search-input`)[0]
    ).toBeDefined();

    const filterButton = screen.getByLabelText('Left panel');
    fireEvent.click(filterButton);
    expect(alertMock).toHaveBeenCalledTimes(1);

    const rowHeightButton = screen.getByRole('button', { name: /Row height/i });
    fireEvent.click(rowHeightButton);

    const rowSizeDropDown = [
      'Extra large',
      'Large (default)',
      'Medium',
      'Small',
      'Extra small',
    ];
    const rowSize = document
      .getElementsByClassName('c4p--datagrid__row-size-dropdown')[0]
      .getElementsByTagName('div')[0]
      .getElementsByTagName('fieldset')[0]
      .getElementsByTagName('div').length;

    for (var k = 0; k < rowSize; k++) {
      expect(
        document
          .getElementsByClassName('c4p--datagrid__row-size-dropdown')[0]
          .getElementsByTagName('div')[0]
          .getElementsByTagName('fieldset')[0]
          .getElementsByTagName('div')
          .item(k)
          .getElementsByTagName('label')[0]
          .getElementsByTagName('span')[1].textContent
      ).toEqual(rowSizeDropDown[k]);
    }

    const refreshButtonElement = screen.getByLabelText('Refresh');
    fireEvent.click(refreshButtonElement);
    expect(alertMock).toHaveBeenCalledTimes(2);

    const downloadButtonElement = screen.getByLabelText('Download CSV');
    fireEvent.click(downloadButtonElement);
    expect(alertMock).toHaveBeenCalledTimes(3);

    const unClickableRow = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr')[0];
    const clickableRow = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr')[1];

    expect(
      unClickableRow
        .getElementsByTagName('td')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('input')[0]
    ).toHaveAttribute('disabled');

    clickableRow
      .getElementsByTagName('td')[0]
      .getElementsByTagName('div')[0]
      .getElementsByTagName('input')[0];

    fireEvent(
      clickableRow
        .getElementsByTagName('td')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('label')[0],
      new MouseEvent('click')
    );

    expect(clickableRow).toHaveClass(`${carbon.prefix}--data-table--selected`);

    expect(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('p')[0]
        .getElementsByTagName('span')[0].textContent
    ).toEqual('1 item selected');

    expect(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[0].textContent
    ).toEqual('Action');
    fireEvent.click(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[0]
    );

    expect(alertMock).toHaveBeenCalledTimes(4);

    expect(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[1].textContent
    ).toEqual('Cancel');
    fireEvent.click(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[1]
    );

    fireEvent.click(clickableRow);
  });

  function clickRow(rowNumber) {
    const row = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr')[rowNumber];

    const rowExpander = row.querySelector(
      `button[aria-label="Expand current row"]`
    );
    fireEvent.click(rowExpander);

    setTimeout(1000);

    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByClassName('c4p--datagrid__expanded-row')
    ).toBeDefined();
    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByClassName('c4p--datagrid__expanded-row')[0].lastChild
        .textContent
    ).toEqual(`Content for ${rowNumber}`);

    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByClassName('c4p--datagrid__expanded-row')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('td')[0]
        .getElementsByTagName('button')[0]
    );

    expect(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByClassName('c4p--datagrid__expanded-row').length
    ).toBe(0);
  }

  it('Expanded Row', async () => {
    render(<ExpandedRow data-testid={dataTestId}></ExpandedRow>);
    clickRow(1);
    clickRow(4);
    clickRow(8);
  });

  function hideSelectAll(rowNumber) {
    var row = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr')[rowNumber];
    var button = row
      .getElementsByTagName('td')[0]
      .getElementsByTagName('div')[0]
      .getElementsByTagName('input')[0];

    fireEvent.click(button);

    expect(row.classList[1]).toEqual(`${carbon.prefix}--data-table--selected`);

    fireEvent.click(button);
    expect(row.classList['0']).toEqual('c4p--datagrid__carbon-row');
  }

  it('Hide Select All', async () => {
    render(<HideSelectAll data-testid={dataTestId}></HideSelectAll>);

    hideSelectAll(2);

    hideSelectAll(5);

    hideSelectAll(8);
  });

  it('Nested Rows', async () => {
    render(<NestedRows data-testid={dataTestId}></NestedRows>);

    const row = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr')[0];
    const firstRow = row
      .getElementsByTagName('td')[0]
      .getElementsByTagName('button')[0];

    fireEvent.click(firstRow);

    expect(row.classList[0]).toEqual('c4p--datagrid__carbon-row-expanded');

    const nestedRow = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr')[1];

    if (nestedRow.className === 'c4p--datagrid__carbon-nested-row') {
      fireEvent.click(
        nestedRow
          .getElementsByTagName('td')[0]
          .getElementsByTagName('button')[0]
      );
    }

    expect(nestedRow.classList[0]).toEqual('c4p--datagrid__carbon-nested-row');
  });

  it('Nested Table', async () => {
    render(<NestedTable data-testid={dataTestId}></NestedTable>);
    fireEvent.click(
      screen
        .getAllByRole('table')[0]
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('td')[0]
        .getElementsByTagName('button')[0]
    );
    expect(
      screen
        .getAllByRole('table')[0]
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('div')[0].childNodes[1].classList[0]
    ).toEqual('c4p--datagrid__expanded-row-content');

    const alertMock = jest.spyOn(window, 'alert');

    fireEvent.click(
      screen
        .getAllByRole('table')[0]
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')[4]
    );

    setTimeout(() => {
      expect(alertMock).toHaveBeenCalledTimes(1);
    }, 1000);
  });

  function radioSelectButton(previousRowNumber, currentRowNumber) {
    if (
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')[previousRowNumber].classList[1] ===
      `.${carbon.prefix}--data-table--selected`
    ) {
      fireEvent.click(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')
          .item(currentRowNumber)
          .getElementsByTagName('td')[0]
          .getElementsByTagName('div')[0]
          .getElementsByTagName('input')[0]
      );

      expect(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')[currentRowNumber].classList[1]
      ).toEqual(`${carbon.prefix}--data-table--selected`);

      expect(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')[previousRowNumber].classList[1]
      ).toBeUndefined();
    } else {
      fireEvent.click(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')
          .item(currentRowNumber)
          .getElementsByTagName('td')[0]
          .getElementsByTagName('div')[0]
          .getElementsByTagName('input')[0]
      );

      expect(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')[currentRowNumber].classList[1]
      ).toEqual(`${carbon.prefix}--data-table--selected`);
    }
  }

  it('Radio Select', async () => {
    render(<RadioSelect data-testid={dataTestId}></RadioSelect>);
    radioSelectButton(1, 1);

    radioSelectButton(1, 4);

    radioSelectButton(4, 7);

    radioSelectButton(2, 6);
  });

  // requires refactor
  it.skip('Select Items In All Pages', async () => {
    const alertMock = jest.spyOn(window, 'alert');

    render(
      <SelectItemsInAllPages data-testid={dataTestId}></SelectItemsInAllPages>
    );
    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('thead')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('th')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('input')[0]
    );

    var numRows = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr').length;

    for (var i = 0; i < numRows; i++) {
      expect(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')[i].classList[1]
      ).toEqual(`${carbon.prefix}--data-table--selected`);
    }

    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('thead')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('th')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('input')[0]
    );
    for (var j = 0; j < numRows; j++) {
      expect(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')[j].classList[0]
      ).toEqual('c4p--datagrid__carbon-row');
    }

    expect(
      document.getElementsByClassName('c4p--datagrid__table-toolbar').length
    ).toBe(1);

    const filterButton = screen.getByLabelText('Left panel');
    fireEvent.click(filterButton);
    expect(alertMock).toHaveBeenCalledTimes(1);

    const rowHeightButton = screen.getByRole('button', { name: /Row height/i });
    fireEvent.click(rowHeightButton);

    expect(
      screen.getByLabelText('Row height', { selector: 'button' })
    ).toHaveClass(`c4p--datagrid__row-size-button--open`);
    expect(
      document.getElementsByClassName('c4p--datagrid__row-size-dropdown')
    ).toBeDefined();
    expect(
      document
        .getElementsByClassName(
          `${carbon.prefix}--radio-button-group ${carbon.prefix}--radio-button-group--vertical ${carbon.prefix}--radio-button-group--label-right`
        )[0]
        .getElementsByTagName('legend')[0].textContent
    ).toEqual('Row height');

    const rowDropDown = [
      'Extra large',
      'Large (default)',
      'Medium',
      'Small',
      'Extra Small',
    ];

    var rowSize = document
      .getElementsByClassName(
        `${carbon.prefix}--radio-button-group ${carbon.prefix}--radio-button-group--vertical ${carbon.prefix}--radio-button-group--label-right`
      )[0]
      .getElementsByTagName('div').length;

    for (let j = 0; i < rowSize; i++) {
      expect(
        document
          .getElementsByClassName(
            `${carbon.prefix}--radio-button-group ${carbon.prefix}--radio-button-group--vertical ${carbon.prefix}--radio-button-group--label-right`
          )[0]
          .getElementsByTagName('div')
          .item(j)
          .getElementsByTagName('label')[0]
          .getElementsByTagName('span')[0].textContent
      ).toEqual(rowDropDown[j]);
    }

    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('thead')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('th')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('input')[0]
    );

    expect(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('p')[0]
        .getElementsByTagName('span')[0].textContent
    ).toEqual('10 items selected');
    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('thead')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('th')[0]
        .getElementsByTagName('button')[0]
    );

    const selectAllOverflow = screen.getByLabelText('Select all', {
      selector: 'button',
    });
    fireEvent.click(selectAllOverflow);

    expect(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[0].textContent
    ).toEqual('Action');
    fireEvent.click(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[0]
    );

    expect(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[1].textContent
    ).toEqual('Cancel');
    fireEvent.click(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[1]
        .getElementsByTagName('button')[1]
    );

    const refreshButton = screen.getByLabelText('Refresh');
    fireEvent.click(refreshButton);
    expect(alertMock).toHaveBeenCalledTimes(3);

    const downloadButton = screen.getByLabelText('Download CSV');
    fireEvent.click(downloadButton);
    expect(alertMock).toHaveBeenCalledTimes(4);
  });

  const RightAlignedColumns = () => {
    const columns = React.useMemo(
      () => [
        ...defaultHeader.slice(0, 3),
        {
          Header: 'Age',
          accessor: 'age',
          rightAlignedColumn: true,
        },
        {
          Header: 'Visits',
          accessor: 'visits',
          rightAlignedColumn: true,
        },
      ],
      []
    );
    const [data] = useState(makeData(10));
    const datagridState = useDatagrid(
      {
        columns,
        data,
      },
      useColumnRightAlign
    );

    return <Datagrid datagridState={{ ...datagridState }} />;
  };

  it('Right Aligned Columns', async () => {
    render(
      <RightAlignedColumns data-testid={dataTestId}></RightAlignedColumns>
    );
    const numRows = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr').length;

    for (var i = 0; i < numRows; i++) {
      expect(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')
          .item(i)
          .getElementsByTagName('td')[3]
          .getElementsByTagName('div')[0].classList[0]
      ).toEqual('c4p--datagrid__right-align-cell-renderer');
    }

    for (var j = 0; j < numRows; j++) {
      expect(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')
          .item(j)
          .getElementsByTagName('td')[4]
          .getElementsByTagName('div')[0].classList[0]
      ).toEqual('c4p--datagrid__right-align-cell-renderer');
    }
  });

  it('Row Size Dropdown', async () => {
    render(<RowSizeDropdown data-testid={dataTestId}></RowSizeDropdown>);

    const alertMock = jest.spyOn(window, 'alert');

    // Click select all rows checkbox
    const selectAllCheckbox = screen.getByLabelText(
      'Select all rows in the table'
    );
    fireEvent.click(selectAllCheckbox);

    // Count number of rows
    const rowSize = screen.getByTestId(dataTestId).querySelector(`tbody`)
      .children.length;

    //This checks to see if all the rows in the table have been selected.
    for (var i = 0; i < rowSize; i++) {
      expect(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')[i].classList[1]
      ).toEqual(`${carbon.prefix}--data-table--selected`);
    }

    expect(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('p')[0]
        .getElementsByTagName('span')[0].textContent
    ).toEqual('10 items selected');

    // Find and click Refresh button
    const actionButton = screen.getByText('Action');
    fireEvent.click(actionButton);
    expect(alertMock).toHaveBeenCalled();

    // Find and click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(alertMock).toHaveBeenCalled();
  });

  it('Selectable Row', async () => {
    render(<SelectableRow data-testid={dataTestId}></SelectableRow>);

    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('thead')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('th')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('label')[0]
    );

    const rows = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr');

    for (var i = 0; i < rows.length; i++) {
      expect(rows.item(i).classList[1]).toEqual(
        `${carbon.prefix}--data-table--selected`
      );
    }

    //Un-Selects all the rows in the table.
    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('thead')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('th')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('label')[0]
    );

    const selectIndividualRow = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr')[0];
    //Selects only one row (in this case, the first one).
    fireEvent.click(
      selectIndividualRow
        .getElementsByTagName('td')[0]
        .getElementsByTagName('div')[0]
        .getElementsByTagName('label')[0]
    );

    expect(selectIndividualRow.classList[1]).toEqual(
      `${carbon.prefix}--data-table--selected`
    );
  });

  it('Sortable Columns', async () => {
    render(<SortableColumns data-testid={dataTestId}></SortableColumns>);

    const headerRow = screen
      .getByRole('table')
      .getElementsByTagName('thead')[0]
      .getElementsByTagName('tr')[0];

    for (var i = 0; i < headerRow.getElementsByTagName('th').length - 1; i++) {
      fireEvent.click(
        headerRow
          .getElementsByTagName('th')
          .item(i)
          .getElementsByTagName('div')[0]
          .getElementsByTagName('button')[0]
      );
      expect(headerRow.getElementsByTagName('th')[i].classList[2]).toEqual(
        'c4p--datagrid__isSorted'
      );
    }
  });

  it('Customizing Columns', async () => {
    render(<CustomizingColumns data-testid={dataTestId}></CustomizingColumns>);

    const alertMock = jest.spyOn(window, 'alert');

    const leftPanelButton = screen.getByLabelText('Left panel');
    fireEvent.click(leftPanelButton);
    expect(alertMock).toHaveBeenCalledTimes(1);

    const refreshButton = screen.getByLabelText('Refresh');
    fireEvent.click(refreshButton);
    expect(alertMock).toHaveBeenCalledTimes(2);

    const downloadButton = screen.getByLabelText('Download CSV');
    fireEvent.click(downloadButton);
    expect(alertMock).toHaveBeenCalledTimes(3);

    const customizeColumnsButton = screen.getByLabelText('Customize columns');
    fireEvent.click(customizeColumnsButton);
    screen.getByRole('heading', { name: /Customize columns/ });
  });

  it('Top Alignment', async () => {
    const ref = React.createRef();
    render(<TopAlignment ref={ref} data-testid={dataTestId} />);

    const alertMock = jest.spyOn(window, 'alert');
    expect(screen.getByRole('table').classList[2]).toEqual(
      'c4p--datagrid__vertical-align-top'
    );

    const topAlignmentRows = screen
      .getByRole('table')
      .getElementsByTagName('tbody')[0]
      .getElementsByTagName('tr');

    const allRowsCheckBox = screen
      .getByRole('table')
      .getElementsByTagName('thead')[0]
      .getElementsByTagName('tr')[0]
      .getElementsByTagName('div')[0]
      .getElementsByTagName('th')[0]
      .getElementsByTagName('div')[0]
      .getElementsByTagName('input')[0];

    fireEvent.click(allRowsCheckBox);

    for (var i = 0; i < topAlignmentRows.length; i++) {
      expect(topAlignmentRows[i].classList[1]).toEqual(
        `${carbon.prefix}--data-table--selected`
      );
    }

    fireEvent.click(allRowsCheckBox);

    for (var j = 0; j < topAlignmentRows.length; j++) {
      fireEvent.click(
        topAlignmentRows[j]
          .getElementsByTagName('td')[0]
          .getElementsByTagName('div')[0]
          .getElementsByTagName('input')[0]
      );
      expect(topAlignmentRows[j].classList[1]).toEqual(
        `${carbon.prefix}--data-table--selected`
      );
    }

    fireEvent.click(allRowsCheckBox);

    expect(
      document.getElementsByClassName(`${carbon.prefix}--search-input`)[0]
    ).toBeDefined();

    expect(screen.getByText(/left panel/i)).toHaveClass(
      `${carbon.prefix}--tooltip-content`
    );

    const rowHeightButton = screen.getByRole('button', { name: /Row height/i });
    fireEvent.click(rowHeightButton);

    const rowSizeDropDown = [
      'Extra large',
      'Large (default)',
      'Medium',
      'Extra small',
    ];
    const rowSize = ref.current.querySelector(
      `.c4p--datagrid__row-size-dropdown`
    );

    for (var k = 0; k < rowSize; k++) {
      expect(
        document
          .getElementsByClassName('c4p--datagrid__row-size-dropdown')[0]
          .getElementsByTagName('div')[0]
          .getElementsByTagName('fieldset')[0]
          .getElementsByTagName('div')
          .item(k)
          .getElementsByTagName('label')[0]
          .getElementsByTagName('span')[1].textContent
      ).toEqual(rowSizeDropDown[k]);
    }

    fireEvent.click(
      document
        .getElementsByClassName('c4p--datagrid__table-toolbar')[0]
        .getElementsByTagName('section')[0]
        .getElementsByTagName('button')[0]
    );
    expect(alertMock).toHaveBeenCalledTimes(1);

    const refreshButton = screen.getByLabelText('Refresh');
    fireEvent.click(refreshButton);
    expect(alertMock).toHaveBeenCalledTimes(2);

    const downloadButton = screen.getByLabelText('Download CSV');
    fireEvent.click(downloadButton);
    expect(alertMock).toHaveBeenCalledTimes(3);
  });

  it('Sticky Actions Column', async () => {
    render(
      <StickyActionsColumn data-testid={dataTestId}></StickyActionsColumn>
    );

    expect(
      screen.findByText(
        'More details documentation check the Notes section below'
      )
    ).toBeDefined();
    for (
      var i = 0;
      i <
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr').length;
      i++
    ) {
      expect(
        screen
          .getByRole('table')
          .getElementsByTagName('tbody')[0]
          .getElementsByTagName('tr')
          .item(i)
          .getElementsByTagName('td')[16].classList[0]
      ).toEqual('c4p--datagrid__right-sticky-column-cell');
    }

    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('td')[16]
        .getElementsByClassName('c4p--datagrid__actions-column-contents')[0]
        .getElementsByTagName('button')[0]
    );

    expect(
      document
        .getElementsByTagName('ul')[0]
        .getElementsByTagName('li')[0]
        .getElementsByTagName('button')[0].textContent
    ).toEqual('Edit');
    fireEvent.click(
      document
        .getElementsByTagName('ul')[0]
        .getElementsByTagName('li')[0]
        .getElementsByTagName('button')[0]
    );
    expect(document.getElementsByTagName('h3')[0].textContent).toMatch(
      'Clicked [edit] on row:'
    );
    fireEvent.click(
      screen
        .getByRole('table')
        .getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr')[0]
        .getElementsByTagName('td')[16]
        .getElementsByClassName('c4p--datagrid__actions-column-contents')[0]
        .getElementsByTagName('button')[0]
    );
    expect(
      document
        .getElementsByTagName('ul')[0]
        .getElementsByTagName('li')[2]
        .getElementsByTagName('button')[0].textContent
    ).toEqual('Retire');
    fireEvent.click(
      document
        .getElementsByTagName('ul')[0]
        .getElementsByTagName('li')[2]
        .getElementsByTagName('button')[0]
    );
    expect(document.getElementsByTagName('h3')[0].textContent).toMatch(
      'Clicked [retire] on row:'
    );
  });
});

const getBatchActions = () => {
  return [
    {
      label: 'Duplicate',
      renderIcon: (props) => <Add size={16} {...props} />,
      onClick: () => {},
    },
    {
      label: 'Add',
      renderIcon: (props) => <Add size={16} {...props} />,
      onClick: () => {},
    },
    {
      label: 'Select all',
      renderIcon: (props) => <Add size={16} {...props} />,
      onClick: () => {},
      type: 'select_all',
    },
    {
      label: 'Publish to catalog',
      renderIcon: (props) => <Add size={16} {...props} />,
      onClick: () => {},
    },
    {
      label: 'Download',
      renderIcon: (props) => <Add size={16} {...props} />,
      onClick: () => {},
    },
    {
      label: 'Delete',
      renderIcon: (props) => <Add size={16} {...props} />,
      onClick: () => {},
      hasDivider: true,
      kind: 'danger',
    },
  ];
};

const TestBatch = () => {
  const columns = React.useMemo(() => defaultHeader, []);
  const [data] = useState(makeData(2));
  const datagridState = useDatagrid(
    {
      columns,
      data,
      batchActions: true,
      toolbarBatchActions: getBatchActions(),
      DatagridActions,
    },
    useSelectRows,
    useSelectAllWithToggle,
    useStickyColumn
  );

  return <Datagrid datagridState={datagridState} />;
};

describe('batch action testing', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global.console, 'error').mockImplementation(() => {});
    //This will suppress the warning about Arrows16 Component (will be removed in the next major version of @carbon/icons-react).
    jest.spyOn(global.console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  window.innerWidth = 2000;
  let mockElement;

  const isTableToolbar = (el) => {
    return (
      el.classList?.contains(`${pkg.prefix}--datagrid__table-toolbar`) || false
    );
  };

  const setMockWidths = (el, type = 'large') => {
    let width = type === 'large' ? 2000 : type === 'medium' ? 1000 : 320;
    if (isTableToolbar(el)) {
      width = type === 'large' ? 3000 : type === 'medium' ? 1000 : 320;
    } else {
      width = type === 'large' ? 500 : type === 'medium' ? 400 : 320;
    }

    return width;
  };

  describe('with space for two actions and menu button', () => {
    beforeEach(() => {
      mockElement = mockHTMLElement({
        offsetWidth: {
          get: function () {
            return setMockWidths(this);
          },
        },
      });
      window.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }));
    });

    afterEach(() => {
      mockElement.mockRestore();
      window.ResizeObserver = ResizeObserver;
    });

    it('renders batch action and checks for the appropriate rendering based on the current mocked widths', async () => {
      const { container } = render(<TestBatch />);
      const firstCheckbox = screen.getAllByLabelText(/datagrid-table-id/)[0];
      await act(() => click(firstCheckbox));

      expect(
        container.querySelector(
          `.${carbon.prefix}--batch-actions.${carbon.prefix}--batch-actions--active`
        )
      ).toBeInTheDocument();

      // Given the default offsetWidth mocks, 2 batch actions should be visible
      // in addition to the MenuButton
      screen.getByLabelText(getBatchActions()[0].label);
      screen.getByLabelText(getBatchActions()[1].label);
      const menuButton = screen.getByRole('button', { name: /More/i });
      expect(menuButton).toBeInTheDocument();
      await act(() => click(menuButton));
      const options = Array.from(
        screen.getByRole('menu', { name: /More/i }).children
      );
      const optionsText = options.map((o) => {
        return o.textContent;
      });
      const remainingBatchActions = [...getBatchActions()].slice(2);

      // Check that the items inside of the MenuButton match the leftover
      // batch action items
      remainingBatchActions.forEach((batchAction, index) => {
        expect(batchAction.label).toEqual(optionsText[index]);
      });
    });
  });
});
