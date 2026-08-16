type Props = {
  investigations?: string;
};

export default function InvestigationBox({
  investigations = "",
}: Props) {
  const tests = (investigations ?? "")
  .split("\n")
  .map((item) => item.trim())
  .filter((item) => item.length > 0);

  if (tests.length === 0) return null;

  return (
    <div className="mt-2 text-[13px]">
      <span className="font-bold">
        Investigations :
      </span>{" "}
      {tests.join(" • ")}
    </div>
  );
}