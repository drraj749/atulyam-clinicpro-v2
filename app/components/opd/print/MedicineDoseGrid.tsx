type Props = {
  morning?: boolean;
  afternoon?: boolean;
  night?: boolean;
  beforeFood?: boolean;
  afterFood?: boolean;
  sos?: boolean;
};

export default function MedicineDoseGrid({
  morning,
  afternoon,
  night,
  beforeFood,
  afterFood,
  sos,
}: Props) {
  function box(value?: boolean) {
    return (
      <div className="w-5 h-5 border border-black flex items-center justify-center text-xs font-bold">
        {value ? "✓" : ""}
      </div>
    );
  }

  return (
    <div className="space-y-2 text-xs">

      <div className="flex items-center gap-3">

        <div className="flex items-center gap-1">
          {box(morning)}
          <span>Morning</span>
        </div>

        <div className="flex items-center gap-1">
          {box(afternoon)}
          <span>Afternoon</span>
        </div>

        <div className="flex items-center gap-1">
          {box(night)}
          <span>Night</span>
        </div>

      </div>

      <div className="flex items-center gap-3">

        <div className="flex items-center gap-1">
          {box(beforeFood)}
          <span>Before Food</span>
        </div>

        <div className="flex items-center gap-1">
          {box(afterFood)}
          <span>After Food</span>
        </div>

        <div className="flex items-center gap-1">
          {box(sos)}
          <span>SOS</span>
        </div>

      </div>

    </div>
  );
}