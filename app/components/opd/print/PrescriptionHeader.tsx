type HospitalSettings = {
  hospitalName: string;
  tagline?: string;

  address: string;
  city?: string;
  state?: string;
  pincode?: string;

  phone?: string;
  email?: string;
  website?: string;

  logo?: string;
};

type Props = {
  patient: {
    patientId: string;
    firstName: string;
    lastName?: string;
    age: number;
    gender: string;
    mobile: string;
  };

  opdNo: string;

  date: string;

  settings: HospitalSettings;
};

export default function PrescriptionHeader({
  patient,
  opdNo,
  date,
  settings,
}: Props) {
  return (
    <div className="border-b border-black pb-2">

      <div className="flex items-center gap-2">

  {/* Logo */}
  <img
  src="/images/logo.png"
  alt="Hospital Logo"
  className="h-12 w-12 object-contain"
/>

  {/* Hospital Details */}
  <div className="flex-1 text-center">

          <h1 className="text-xl font-bold uppercase tracking-wide">
            {settings.hospitalName}
          </h1>

          {settings.tagline && (
            <p className="text-[11px]">
              {settings.tagline}
            </p>
          )}

          <p className="text-[10px]">
            {[
              settings.address,
              settings.city,
              settings.state,
              settings.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>

          <p className="text-[10px]">
            {settings.phone}
            {settings.phone && settings.website && " | "}
            {settings.website}
          </p>

        </div>

{/* QR Codes */}
<div className="flex gap-2">

  <div className="text-center">
    <img
      src="/images/maps-qr.png"
      alt="Google Maps"
      className="h-10 w-10"
    />
    <p className="text-[8px]">Maps</p>
  </div>

  <div className="text-center">
    <img
      src="/images/whatsapp-qr.png"
      alt="WhatsApp"
      className="h-10 w-10"
    />
    <p className="text-[8px]">WhatsApp</p>
  </div>

</div>

</div>

      <div className="mt-2 text-[12px]">

        <div className="flex justify-between">
          <span>
            <b>UHID:</b> {patient.patientId}
          </span>

          <span>
            <b>OPD:</b> {opdNo}
          </span>

          <span>
            <b>Date:</b>{" "}
            {new Date(date).toLocaleDateString("en-IN")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-1">

          <span>
            <b>Name:</b>{" "}
            {patient.firstName} {patient.lastName}
          </span>

          <span className="text-center">
  <b>Age/Sex:</b> {patient.age}/{patient.gender}
</span>

<span className="text-right">
  <b>Mobile:</b> {patient.mobile}
</span>

        </div>

      </div>

    </div>
  );
}