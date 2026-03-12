Set Sound = CreateObject("WMPlayer.OCX.7")
Sound.URL = WScript.Arguments(0)
Sound.Controls.play
WScript.Sleep 500
Do While Sound.PlayState = 3
  WScript.Sleep 100
Loop