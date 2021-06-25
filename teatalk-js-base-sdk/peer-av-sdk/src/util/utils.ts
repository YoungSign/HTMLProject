export let generateCallId = function (id: number) {
  return id + new Date().getTime().toString().slice(-4);
};