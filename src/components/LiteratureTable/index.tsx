import React, {useMemo, useState} from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import type {LiteratureItem} from '@/src/data/literatureData';
import styles from './styles.module.css';

interface LiteratureTableProps {
  data: readonly LiteratureItem[];
}

const columnHelper = createColumnHelper<LiteratureItem>();

export default function LiteratureTable({
  data,
}: LiteratureTableProps): React.ReactElement {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [chapterFilter, setChapterFilter] = useState<string>('');

  const chapters = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => d.chapterTitleZh && set.add(d.chapterTitleZh));
    return Array.from(set);
  }, [data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {header: 'ID', size: 100}),
      columnHelper.accessor('title', {
        header: '标题 / Title',
        cell: (info) => (
          <div className={styles.titleCell}>
            <div className={styles.titleMain}>{info.getValue()}</div>
            {info.row.original.url ? (
              <a
                className={styles.titleLink}
                href={info.row.original.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                原文 �?              </a>
            ) : null}
          </div>
        ),
      }),
      columnHelper.accessor('authors', {header: '作�?/ Authors'}),
      columnHelper.accessor('year', {header: '年份 / Year', size: 80}),
      columnHelper.accessor('venue', {header: '发表 / Venue'}),
      columnHelper.accessor('chapterTitleZh', {header: '章节 / Chapter'}),
      columnHelper.accessor('sectionTitleZh', {header: '子方�?/ Section'}),
      columnHelper.accessor('priority', {header: '优先�?/ Priority', size: 90}),
    ],
    [],
  );

  const filtered = useMemo(() => {
    if (!chapterFilter) return data;
    return data.filter((d) => d.chapterTitleZh === chapterFilter);
  }, [data, chapterFilter]);

  const table = useReactTable({
    data: filtered as LiteratureItem[],
    columns,
    state: {sorting, columnFilters, globalFilter},
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {pagination: {pageSize: 15}},
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="搜索标题 / 作�?/ 关键词�?
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <select
          className={styles.select}
          value={chapterFilter}
          onChange={(e) => setChapterFilter(e.target.value)}
        >
          <option value="">全部章节</option>
          {chapters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className={styles.count}>�?{filtered.length} �?/span>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    style={{width: h.getSize?.() ?? undefined}}
                    onClick={h.column.getToggleSortingHandler()}
                    className={h.column.getCanSort() ? styles.sortable : ''}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === 'asc' ? ' �? : null}
                    {h.column.getIsSorted() === 'desc' ? ' �? : null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pager}>
        <button
          className={styles.pageBtn}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          上一�?        </button>
        <span>
          �?{table.getState().pagination.pageIndex + 1} /{' '}
          {table.getPageCount() || 1} �?        </span>
        <button
          className={styles.pageBtn}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          下一�?        </button>
      </div>
    </div>
  );
}
