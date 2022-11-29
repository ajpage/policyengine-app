import RadioButton from "../../../controls/RadioButton";
import {
  addYearlyVariables,
  getNewHouseholdId,
  removePerson,
} from "../../../api/variables";
import CenteredMiddleColumn from "../../../layout/CenteredMiddleColumn";
import { useSearchParams } from "react-router-dom";
import { copySearchParams } from "../../../api/call";
import { useState } from "react";
import NavigationButton from "../../../controls/NavigationButton";

function getUKMaritalStatus(situation) {
  const partnerName = "your partner";
  if (partnerName in situation.people) {
    return "married";
  } else {
    return "single";
  }
}

function setUKMaritalStatus(situation, status, variables, entities) {
  const currentStatus = getUKMaritalStatus(situation);
  const defaultPartner = {
    age: { 2022: 30 },
  };
  const partnerName = "your partner";
  if (status === "married" && currentStatus === "single") {
    situation.people[partnerName] = defaultPartner;
    situation.benunits["your immediate family"].members.push(partnerName);
    situation.benunits["your immediate family"].is_married["2022"] = true;
    situation.households["your household"].members.push(partnerName);
    situation = addYearlyVariables(situation, variables, entities);
  } else if (status === "single" && currentStatus === "married") {
    situation = removePerson(situation, partnerName);
  }
  return situation;
}

function getUSMaritalStatus(situation) {
  const partnerName = "your partner";
  if (Object.keys(situation.people).includes(partnerName)) {
    return "married";
  } else {
    return "single";
  }
}

function setUSMaritalStatus(situation, status, variables, entities) {
  const currentStatus = getUSMaritalStatus(situation);
  const defaultPartner = {
    age: { 2022: 30 },
  };
  const partnerName = "your partner";
  if (status === "married" && currentStatus === "single") {
    situation.people[partnerName] = defaultPartner;
    situation.families["your family"].members.push(partnerName);
    situation.marital_units["your marital unit"].members.push(partnerName);
    situation.tax_units["your tax unit"].members.push(partnerName);
    situation.spm_units["your household"].members.push(partnerName);
    situation.households["your household"].members.push(partnerName);
    situation = addYearlyVariables(situation, variables, entities);
  } else if (status === "single" && currentStatus === "married") {
    situation = removePerson(situation, partnerName);
  }
  return situation;
}

export default function MaritalStatus(props) {
  const { metadata, household } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const getMaritalStatus = { uk: getUKMaritalStatus, us: getUSMaritalStatus }[
    metadata.countryId
  ];
  const setMaritalStatusInHousehold = {
    uk: setUKMaritalStatus,
    us: setUSMaritalStatus,
  }[metadata.countryId];
  const [value, setValue] = useState(null);
  const setMaritalStatus = (status) => {
    let newHousehold = setMaritalStatusInHousehold(
      household.input,
      status,
      metadata.variables,
      metadata.entities
    );
    getNewHouseholdId(metadata.countryId, newHousehold).then((householdId) => {
      let newSearch = copySearchParams(searchParams);
      newSearch.set("household", householdId);
      newSearch.set("focus", "input.household.children");
      setSearchParams(newSearch);
    });
  };
  const radioButtonComponent = (
    <RadioButton
      keys={["single", "married"]}
      labels={["Single", "Married"]}
      defaultValue={household.baseline && getMaritalStatus(household.input)}
      value={value}
      onChange={status => {
        setMaritalStatus(status);
        setValue(status);
      }}
    />
  );
  return (
    <CenteredMiddleColumn
      title="What is your marital status?"
      children={
        <>
          {radioButtonComponent}
          <NavigationButton
            text="Enter"
            focus="input.household.children"
          />
        </>
      }
    />
  );
}
