import { DefSection } from './components/DefSection'
import { Disclaimer } from './components/Disclaimer'
import { EnemySection } from './components/EnemySection'
import { resultHint } from './components/errorMessages'
import { ResetButton } from './components/ResetButton'
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
    reset,
  } = useCalcInput()

  return (
    <main className="mx-auto min-h-screen max-w-md space-y-4 p-4 text-slate-900">
      <h1 className="text-xl font-bold">ドカバト 被ダメージ計算ツール</h1>
      <div className="space-y-1">
        {/* スマホで下の入力欄を操作している間も結果が見えるよう、上部に固定する */}
        <div className="sticky top-2 z-10">
          <ResultPanel result={result} hint={resultHint(errors)} />
        </div>
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
      <ResetButton onReset={reset} />
    </main>
  )
}

export default App
