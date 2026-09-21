const PLAYER_DRAG_TYPE = 'application/x-cs2-player'

export function writeDraggedPlayer(event: DragEvent, playerId: string) {
  if (!event.dataTransfer) return
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData(PLAYER_DRAG_TYPE, playerId)
  event.dataTransfer.setData('text/plain', playerId)
}

export function readDraggedPlayer(event: DragEvent): string {
  return event.dataTransfer?.getData(PLAYER_DRAG_TYPE)
    || event.dataTransfer?.getData('text/plain')
    || ''
}
