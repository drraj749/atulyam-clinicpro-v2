"use client";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Card from "../ui/Card";

type Props = {
  form: {
    firstName: string;
    lastName: string;
    age: string;
    gender: string;
    mobile: string;
    aadhaar: string;
    bloodGroup: string;
    occupation: string;
  };

  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
};

export default function PatientBasicInfo({
  form,
  onChange,
}: Props) {
  return (
    <Card title="Patient Information">
      <div className="grid grid-cols-2 gap-4">

        <Input
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={onChange}
        />

        <Input
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={onChange}
        />

        <Input
          label="Age"
          type="number"
          name="age"
          value={form.age}
          onChange={onChange}
        />

        <Select
          label="Gender"
          name="gender"
          value={form.gender}
          onChange={onChange}
          options={[
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
            { label: "Other", value: "Other" },
          ]}
        />

        <Input
          label="Mobile"
          name="mobile"
          value={form.mobile}
          onChange={onChange}
        />

        <Input
          label="Aadhaar"
          name="aadhaar"
          value={form.aadhaar}
          onChange={onChange}
        />

        <Select
          label="Blood Group"
          name="bloodGroup"
          value={form.bloodGroup}
          onChange={onChange}
          options={[
            { label: "O+", value: "O+" },
            { label: "O-", value: "O-" },
            { label: "A+", value: "A+" },
            { label: "A-", value: "A-" },
            { label: "B+", value: "B+" },
            { label: "B-", value: "B-" },
            { label: "AB+", value: "AB+" },
            { label: "AB-", value: "AB-" },
          ]}
        />

        <Input
          label="Occupation"
          name="occupation"
          value={form.occupation}
          onChange={onChange}
        />

      </div>
    </Card>
  );
}