export default function PageHeader({ title, context = null }) {
  return (
    <div className="page-title-block">
      <p className="eyebrow">My Baseball Record</p>
      <h1 className="page-title">
        {title}
        {context ? <span className="title-context"> {context}</span> : null}
      </h1>
    </div>
  );
}
