interface Props {
  eyebrow?: string;
  title: string;
  lead?: string;
}

/** The top of every inner page, so they all start the same way. */
const PageHeader = ({ eyebrow, title, lead }: Props) => {
  return (
    <div className={`mb-8 max-w-3xl`}>
      {eyebrow && (
        <p className={`mb-2 text-xs uppercase tracking-[0.2em] opacity-70 xs:text-sm`}>{eyebrow}</p>
      )}

      <h1 className={`text-3xl font-bold leading-tight xs:text-4xl`}>{title}</h1>

      {lead && <p className={`mt-3 text-base opacity-85 xs:text-lg`}>{lead}</p>}
    </div>
  );
};

export default PageHeader;
