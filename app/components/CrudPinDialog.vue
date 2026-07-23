<script setup lang="ts">
import { ref } from 'vue'
import { REGEXP_ONLY_DIGITS } from 'vue-input-otp'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

const { isOpen } = useCrudGateState()
const pin = ref('')
const submitting = ref(false)

function cancel() {
  pin.value = ''
  resolveCrudGate(false)
}

async function submit() {
  if (pin.value.length !== 6 || submitting.value) return
  submitting.value = true

  try {
    await unlockCrud(pin.value)
    toast.success('Unlocked for 15 minutes.')
    pin.value = ''
    resolveCrudGate(true)
  } catch (error: any) {
    toast.error(error?.data?.statusMessage ?? error?.statusMessage ?? 'Incorrect PIN')
    pin.value = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="(value) => { if (!value) cancel() }">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>Enter PIN to make changes</DialogTitle>
        <DialogDescription>
          Anyone can view the roster. Editing needs the shared 6-digit PIN, valid for 15 minutes once entered.
        </DialogDescription>
      </DialogHeader>

      <form class="flex flex-col items-center gap-4" @submit.prevent="submit">
        <InputOTP v-model="pin" :maxlength="6" :pattern="REGEXP_ONLY_DIGITS" :disabled="submitting" @complete="submit">
          <InputOTPGroup>
            <InputOTPSlot v-for="index in 6" :key="index" :index="index - 1" />
          </InputOTPGroup>
        </InputOTP>

        <DialogFooter class="w-full">
          <Button type="button" variant="outline" class="flex-1" @click="cancel">
            Cancel
          </Button>
          <Button type="submit" class="flex-1" :disabled="pin.length !== 6 || submitting">
            Unlock
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
