import { DefSection } from './components/DefSection'
import { Disclaimer } from './components/Disclaimer'
import { EnemySection } from './components/EnemySection'
import { resultHint } from './components/errorMessages'
import { ResultPanel } from './components/ResultPanel'
import { useCalcInput } from './hooks/useCalcInput'

function App() {
  const {
    form,
    errors,
    result,
    setField,
    setAppliedPercent,
    addEffect,
    updateEffect,
    removeEffect,
  } = useCalcInput()

  return (
    <main className="mx-auto min-h-screen max-w-md space-y-4 bg-slate-100 p-4 text-slate-900">
      <h1 className="text-xl font-bold">ドカバト 被ダメージ計算ツール</h1>
      <div className="space-y-1">
        <ResultPanel result={result} hint={resultHint(errors)} />
        <Disclaimer />
      </div>
      <DefSection
        screenDef={form.screenDef}
        onScreenDefChange={(value) => setField('screenDef', value)}
        effects={form.effects}
        onAddEffect={addEffect}
        onUpdateEffect={updateEffect}
        onRemoveEffect={removeEffect}
        appliedPercent={form.appliedPercent}
        onAppliedPercentChange={setAppliedPercent}
        errors={errors}
      />
      <EnemySection form={form} errors={errors} onChange={setField} />
    </main>
  )
}

export default App
