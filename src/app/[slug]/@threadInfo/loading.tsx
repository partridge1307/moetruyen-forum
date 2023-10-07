const loading = () => {
  return (
    <div>
      <div className="aspect-video rounded-t-md animate-pulse bg-background" />
      <div className="h-14 animate-pulse bg-background/60" />
      <div className="h-72 animate-pulse bg-background" />
      <div className="h-36 lg:h-72 rounded-b-md animate-pulse bg-background/75" />
    </div>
  );
};

export default loading;
