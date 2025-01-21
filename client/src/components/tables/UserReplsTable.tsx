import { Repl } from "@/types";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  LuArrowUpDown,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { MdMoreHoriz } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import {
  deleteReplByReplid,
  getReplByReplid,
  getReplsByUserId,
} from "@/api/repl";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import React, { useState } from "react";
import { useModal } from "@/hooks/useModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import "./replTable.css";

interface UserReplsTableProps {
  repls: Repl[];
  setUserRepls: React.Dispatch<React.SetStateAction<Repl[]>>;
}

export const UserReplsTable = ({
  repls,
  setUserRepls,
}: UserReplsTableProps) => {
  const { onOpen, setData } = useModal((state) => state);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [projToDelete, setProjToDelete] = useState<any | null>({
    _id: "",
    name: "",
  });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const handleProjectDeleteClick = (_id: string, projName: string) => {
    setProjToDelete({
      _id: _id,
      name: projName,
    });
    setDeleteProjectDialogOpen(true);
  };

  const handleProjectDeleteConfirmation = async () => {
    try {
      if (!projToDelete?._id) {
        toast.error("Unable to delete the project. Try again later.");
        return;
      }
      await deleteReplByReplid(projToDelete._id);
      toast.success(`Project ${projToDelete.name} deleted successfully.`);
      setUserRepls((prev) =>
        prev.filter((repl) => repl._id !== projToDelete._id)
      );
    } catch (error) {
      toast.error("Unable to delete the project. Try again later.");
    } finally {
      setIsDeletingProject(false);
    }
  };

  const handleProjectInspectClick = async (_id: string) => {
    try {
      const resp = await getReplByReplid(_id);
      setData(resp.repl);
      setTimeout(() => {
        onOpen("InspectProject");
      }, 200);
    } catch (error) {
      toast.error("Unable to inspect the project. Try again later.");
    }
  };

  const columns: ColumnDef<Repl>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <LuArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize max-w-20 truncate">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "language",
      header: "Language",
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("language")}</div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Modified",
      cell: ({ row }) => (
        <p className="text-[13px]">
          {formatDistanceToNow(new Date(row.getValue("updatedAt")), {
            addSuffix: true,
          })}
        </p>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const rowRepl: Repl = row.original;
        const _id = rowRepl._id;
        const projname = rowRepl.name;
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open Menu</span>
                  <MdMoreHoriz />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-neutral-700">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleProjectInspectClick(_id)}
                >
                  Inspect
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleProjectDeleteClick(_id, projname)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog
              open={deleteProjectDialogOpen}
              onOpenChange={() => {
                setDeleteProjectDialogOpen((prev) => !prev);
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete this project?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    any information associated with this project.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletingProject}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleProjectDeleteConfirmation}
                    disabled={isDeletingProject}
                  >
                    {isDeletingProject ? "Please wait.." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
      },
    },
  ];

  const table = useReactTable({
    data: repls,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <>
      <div className="w-full px-2 h-full">
        <div className="flex items-center py-2">
          <Input
            placeholder="Filter Projects..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm border border-white ring-0 focus-visible:ring-1"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-auto bg-neutral-600 text-white hover:bg-neutral-700">
                <div className="flex items-center gap-1">
                  Columns <LuChevronDown className="h-5 w-5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-700">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table className="border border-slate-600">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        className="border-b border-b-slate-600"
                        key={header.id}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className="border-b border-b-slate-600"
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[4, 6, 8, 10].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              className="hidden h-8 w-8 p-0 lg:flex bg-neutral-600 text-white hover:bg-neutral-700"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <LuChevronsLeft />
            </Button>
            <Button
              className="h-8 w-8 p-0 bg-neutral-600 text-white hover:bg-neutral-700"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <LuChevronLeft />
            </Button>
            <Button
              className="h-8 w-8 p-0 bg-neutral-600 text-white hover:bg-neutral-700"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <LuChevronRight />
            </Button>
            <Button
              className="hidden h-8 w-8 p-0 lg:flex bg-neutral-600 text-white hover:bg-neutral-700"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <LuChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
