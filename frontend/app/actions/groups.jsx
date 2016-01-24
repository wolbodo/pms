
export function update(id, group) {
  return {
    type: "GROUPS_UPDATE",
    id, group
  }
}