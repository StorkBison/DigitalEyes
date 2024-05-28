import { CollectionFiltersProps } from "./interfaces/props"
import { StyledSelect } from "../StyledSelect"
import parse from "html-react-parser"
import { RefreshIcon, XCircleIcon } from "@heroicons/react/outline"
import { useCollectionFiltersQuery } from "../../generated/graphql"
import { log } from "console"
import { truncateStr } from "../../utils"

export const CollectionFilters = ({
  showActiveFilters,
  filtersFromMetadata,
  filtersData,
  selectedFilters,
  addSelectedFilter,
  resetFilters,
  toggleActiveFilters,
}: CollectionFiltersProps) => {
  // console.log("dd", filtersFromMetadata, filtersData)

  return (
    <div
      style={{
        display:
          showActiveFilters && filtersData?.length > 0 ? "block" : "none",
      }}
      className="fixed md:relative top-12 md:top-0 z-5 left-0 bg-black md:bg-transparent p-6 md:p-0 w-64 md:w-auto overflow-auto md:overflow-visible h-full w-auto md:w-64 lg:w-72 md:pr-6"
    >
      <button onClick={toggleActiveFilters} className="md:hidden">
        <XCircleIcon className="absolute top-2 right-2 w-7  text-white" />
      </button>
      {filtersData?.map((filter, idx) => (
        <div key={`${idx}-attr`}>
          {/* <label className="text-xs text-white uppercase">{filter.name}</label> */}
          <div className="border border-gray-800 rounded-md mt-1 mb-4">
            <StyledSelect
              key={filter.name}
              options={Object.keys(filter.values)
                .sort(
                  new Intl.Collator("en", {
                    numeric: true,
                    sensitivity: "accent",
                  }).compare
                )
                .sort((a, b) => {
                  return filter.values[a].floor - filter.values[b].floor
                })
                .map((value: any) => {
                  const { total, floor } = filter.values[value]
                  return {
                    value: value,
                    label: parse(
                      `<div class="flex justify-between"><span>${
                        value.length > 12 ? truncateStr(value, 12) : value
                      } (${total})</span> <span class="text-xs"> Floor: ${(
                        floor / 1000000000
                      ).toFixed(2)} </span> </div>`
                    ),
                  }
                })}
              placeholderPrefix={`${filter.name}:`}
              onChange={(
                selectedFilter: { value: any; label: string },
                action: any
              ) => {
                addSelectedFilter(filter.name, selectedFilter)
              }}
              value={
                !!selectedFilters?.[filter.name]
                  ? {
                      value: selectedFilters[filter.name],
                      label: selectedFilters[filter.name],
                    }
                  : null
              }
              placeholder={filter.name}
              isClearable={true}
            />
          </div>
        </div>
      ))}
      {/* {filtersFromMetadata?.map((filter, idx) => (
        <div key={`${idx}-attr`}>
          <label className="text-xs text-white uppercase">{filter.name}</label>
          <div className="border border-gray-800 rounded-md mt-1 mb-4">
            <StyledSelect
              key={filter.name}
              options={filter.values
                .sort(
                  new Intl.Collator("en", {
                    numeric: true,
                    sensitivity: "accent",
                  }).compare
                )
                .map((value: any) => {
                  return {
                    value,
                    label: value,
                  }
                })}
              placeholderPrefix={`${filter.name}:`}
              onChange={(
                selectedFilter: { value: any; label: string },
                action: any
              ) => {
                addSelectedFilter(filter.name, selectedFilter)
              }}
              value={
                !!selectedFilters?.[filter.name]
                  ? {
                      value: selectedFilters[filter.name],
                      label: selectedFilters[filter.name],
                    }
                  : null
              }
              placeholder={filter.name}
              isClearable={true}
            />
          </div>
        </div>
      ))} */}
      <button
        className="w-full py-2 font-medium text-white uppercase hover:text-gray-500 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm flex items-center space-x-6"
        onClick={resetFilters}
      >
        <span>Reset filters</span>{" "}
        <RefreshIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}

export default CollectionFilters
