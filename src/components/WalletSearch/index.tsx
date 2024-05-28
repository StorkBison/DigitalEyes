import React from "react"
import CreatableSelect from "react-select/creatable"

function WalletSearch(props: any) {
  const creatableSelectStyles = {
    cursor: "text",
    control: (provided: any) => ({
      ...provided,
      boxShadow: "none",
      backgroundColor: "transparent",
      border: "2px solid transparent",
      borderRadius: "0px",
      borderBottom: "0px",
      "&:hover": {
        borderColor: "none",
      },
      color: "#fff",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontWeight: state.isSelected ? "normal" : "300",
      backgroundColor: "transparent",
      color: "var(--color-main-secondary)",
      fontSize: "15px",
      "&:hover": {
        backgroundColor: "#666666",
        color: "#000",
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      backgroundColor: "transparent",
      fontWeight: "300",
      color: "#fff",
      width: "100%",
      fontSize: "14px",
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      display: "none",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      display: "none",
    }),
    menu: (provided: any) => ({
      ...provided,
      marginTop: "10px",
      borderRadius: "5px",
      boxShadow: "0px 4px 20px 0px #0000001A",
    }),
    indicatorContainer: (provided: any) => ({
      ...provided,
      color: "var(--color-main-secondary)",
    }),
    menuPortal: (provided: any, state: any) => ({
      ...provided,
      zIndex: "20",
      position: "fixed",
      borderRadius: "5px",
      boxShadow: "0px 4px 20px 0px #0000001A",
    }),
    menuList: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "#171717",
      borderWidth: "0px",
      borderRadius: "5px",
      borderColor: "#333",
      paddingRight: "15px",
      "::-webkit-scrollbar": {
        width: "9px",
      },
      "::-webkit-scrollbar-track": {
        background: "transparent",
      },
      "::-webkit-scrollbar-thumb": {
        background: "#878787",
        borderRadius: "6px",
      },
      "::-webkit-scrollbar-thumb:hover": {
        background: "#555",
      },
    }),
  }
  return (
    <div>
      <CreatableSelect
        styles={creatableSelectStyles}
        options={props.options}
        placeholder={props.placeholder}
        placeholderPrefix={props.placeholderPrefix}
        isClearable={true}
        isLoading={props.isLoading}
        onChange={props.onChange}
        {...props}
      />
    </div>
  )
}

export default WalletSearch
